-- Streak freezes: cobrem 1 dia sem leitura sem quebrar a sequência.
--
-- Motivação: hoje, qualquer dia em branco zera a streak — o que pune viagens,
-- dias doentes ou meses caóticos e desincentiva o uso a longo prazo. Cada
-- usuário ganha 1 freeze por mês, automaticamente, na primeira sessão do
-- mês. Pode consumi-lo manualmente pra cobrir o dia anterior se quebrou a
-- streak — funciona como "rede de segurança" estilo Duolingo.
--
-- Modelo: cada linha representa um freeze. Disponível enquanto consumed_at
-- for null. Ao consumir, o usuário escolhe a data coberta (uma data por
-- freeze, validada pela RPC).

create table if not exists public.streak_freezes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_for_month date not null,
  consumed_at timestamptz,
  consumed_for_date date,
  constraint streak_freezes_consumed_consistency
    check ((consumed_at is null and consumed_for_date is null)
        or (consumed_at is not null and consumed_for_date is not null))
);

comment on table public.streak_freezes is
  'Freezes mensais que cobrem 1 dia sem leitura sem quebrar a streak. Concedidos automaticamente, consumidos sob demanda.';

comment on column public.streak_freezes.granted_for_month is
  'Truncado ao primeiro dia do mês de concessão. Usado para garantir 1 freeze por mês.';

-- Um freeze por usuário por mês.
create unique index if not exists streak_freezes_user_month_unique
  on public.streak_freezes (user_id, granted_for_month);

create index if not exists streak_freezes_user_consumed_idx
  on public.streak_freezes (user_id, consumed_at);

create index if not exists streak_freezes_user_consumed_date_idx
  on public.streak_freezes (user_id, consumed_for_date)
  where consumed_for_date is not null;

-- RLS: usuário só vê e modifica seus próprios freezes. A escrita real
-- (insert/update) acontece exclusivamente via RPC SECURITY DEFINER —
-- removemos os grants de escrita do role authenticated logo abaixo.
alter table public.streak_freezes enable row level security;

create policy "streak_freezes_select_own"
  on public.streak_freezes for select
  using (auth.uid() = user_id);

revoke insert, update, delete on public.streak_freezes from authenticated;
grant select on public.streak_freezes to authenticated;

-- ─── RPC: consumir um freeze ─────────────────────────────────────────────────
--
-- Marca um freeze disponível como consumido para cobrir uma data específica.
-- Validações:
--   - Usuário autenticado
--   - Data dentro dos últimos 2 dias (não cobre dias antigos arbitrários)
--   - Data não pode ser hoje nem futura (faz sentido só pra dias perdidos)
--   - Dia ainda não tem leitura (não desperdiça freeze)
--   - Dia ainda não tem freeze (não duplica)
--   - Usuário tem ao menos um freeze disponível

create or replace function public.consume_streak_freeze(p_date date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_freeze_id uuid;
  v_has_session boolean;
  v_has_freeze boolean;
begin
  if v_user_id is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  if p_date is null then
    raise exception 'p_date é obrigatório' using errcode = '22023';
  end if;

  -- Só permite cobrir os últimos 2 dias (ontem ou anteontem). Mais que isso
  -- é abuso retroativo — a streak já era.
  if p_date >= current_date then
    raise exception 'Não dá pra usar freeze para hoje ou no futuro'
      using errcode = '22023';
  end if;

  if p_date < current_date - 2 then
    raise exception 'Freeze só cobre os últimos 2 dias'
      using errcode = '22023';
  end if;

  -- Não desperdiça freeze em dia com leitura.
  select exists(
    select 1 from public.reading_sessions
     where user_id = v_user_id and date = p_date
  ) into v_has_session;

  if v_has_session then
    raise exception 'Esse dia já tem leitura registrada' using errcode = '22023';
  end if;

  -- Não duplica freeze pro mesmo dia.
  select exists(
    select 1 from public.streak_freezes
     where user_id = v_user_id and consumed_for_date = p_date
  ) into v_has_freeze;

  if v_has_freeze then
    raise exception 'Esse dia já está coberto por um freeze' using errcode = '22023';
  end if;

  -- Pega o freeze disponível mais antigo (FIFO).
  select id into v_freeze_id
    from public.streak_freezes
   where user_id = v_user_id and consumed_at is null
   order by granted_at
   limit 1
   for update;

  if v_freeze_id is null then
    raise exception 'Sem freeze disponível' using errcode = 'P0002';
  end if;

  update public.streak_freezes
     set consumed_at = now(),
         consumed_for_date = p_date
   where id = v_freeze_id;

  return jsonb_build_object(
    'freezeId', v_freeze_id,
    'coveredDate', p_date
  );
end;
$$;

revoke all on function public.consume_streak_freeze(date) from public;
grant execute on function public.consume_streak_freeze(date) to authenticated;

-- ─── RPC log_reading_session: auto-grant mensal + streak com freeze ─────────
--
-- Mantém a forma e o contrato da função existente (mesmo retorno). Mudanças:
--   1. Concede automaticamente o freeze do mês corrente se ainda não houver.
--   2. Inclui as datas cobertas por freeze no cálculo de streak (para
--      conquistas e retorno em runtime futuro).

create or replace function public.log_reading_session(
  p_book_id uuid,
  p_pages_read integer,
  p_duration_minutes integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id          uuid := auth.uid();
  v_book             public.books%rowtype;
  v_profile          public.profiles%rowtype;
  v_duration         integer := coalesce(p_duration_minutes, 0);
  v_new_page         integer;
  v_is_finished      boolean;
  v_xp_gained        integer;
  v_new_total_xp     integer;
  v_new_level        integer;
  v_leveled_up       boolean;
  v_streak           integer;
  v_pages_today      integer;
  v_books_finished   integer;
  v_total_books      integer;
  v_session_count    integer;
  v_hour             integer;
  v_timezone         text;
  v_ach              record;
  v_new_achievements text[] := '{}';
begin
  if v_user_id is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  if p_pages_read is null or p_pages_read < 1 or p_pages_read > 10000 then
    raise exception 'pages_read deve estar entre 1 e 10000' using errcode = '22023';
  end if;

  if v_duration < 0 or v_duration > 1440 then
    raise exception 'duration_minutes deve estar entre 0 e 1440' using errcode = '22023';
  end if;

  select * into v_book
    from public.books
   where id = p_book_id and user_id = v_user_id
   for update;

  if not found then
    raise exception 'Livro não encontrado' using errcode = 'P0002';
  end if;

  v_new_page := least(v_book.total_pages, v_book.current_page + p_pages_read);
  v_is_finished := v_book.total_pages > 0 and v_new_page = v_book.total_pages;

  insert into public.reading_sessions
    (user_id, book_id, pages_read, duration_minutes, date)
  values
    (v_user_id, p_book_id, p_pages_read, v_duration, current_date);

  update public.books
     set current_page = v_new_page,
         status = case when v_is_finished then 'finished' else status end
   where id = p_book_id;

  v_xp_gained := p_pages_read * 10 + v_duration * 5;

  select * into v_profile
    from public.profiles
   where id = v_user_id
   for update;

  v_new_total_xp := coalesce(v_profile.xp, 0) + v_xp_gained;
  v_new_level := floor(v_new_total_xp / 1000) + 1;
  v_leveled_up := v_new_level > coalesce(v_profile.level, 1);

  update public.profiles
     set xp = v_new_total_xp,
         level = v_new_level
   where id = v_user_id;

  -- Auto-grant: 1 freeze por mês. Idempotente pelo índice único
  -- (user_id, granted_for_month).
  insert into public.streak_freezes (user_id, granted_for_month)
  values (v_user_id, date_trunc('month', current_date)::date)
  on conflict (user_id, granted_for_month) do nothing;

  v_timezone := coalesce(v_profile.timezone, 'America/Sao_Paulo');
  v_hour := extract(hour from (now() at time zone v_timezone))::integer;

  select coalesce(sum(pages_read), 0) into v_pages_today
    from public.reading_sessions
   where user_id = v_user_id and date = current_date;

  select count(*) into v_session_count
    from public.reading_sessions
   where user_id = v_user_id;

  select count(*) into v_total_books
    from public.books
   where user_id = v_user_id;

  select count(*) into v_books_finished
    from public.books
   where user_id = v_user_id and status = 'finished';

  -- Streak considerando freezes: união das datas com leitura e das datas
  -- cobertas por freezes consumidos.
  select coalesce(max(streak_len), 0) into v_streak
  from (
    select count(*) as streak_len, max(d) as end_d
    from (
      select d, d - (row_number() over (order by d))::integer as grp
      from (
        select date as d
          from public.reading_sessions
         where user_id = v_user_id and date <= current_date
        union
        select consumed_for_date as d
          from public.streak_freezes
         where user_id = v_user_id
           and consumed_for_date is not null
           and consumed_for_date <= current_date
      ) all_dates
      group by d
    ) islands
    group by grp
  ) streaks
  where end_d >= current_date - 1;

  for v_ach in
    select a.id, a.name, a.criteria_type, a.criteria_value
      from public.achievements a
     where not exists (
       select 1 from public.user_achievements ua
        where ua.user_id = v_user_id and ua.achievement_id = a.id
     )
  loop
    if (
      case v_ach.criteria_type
        when 'first_log'      then v_session_count >= 1
        when 'streak'         then v_streak >= coalesce(v_ach.criteria_value, 3)
        when 'pages_day'      then v_pages_today >= coalesce(v_ach.criteria_value, 100)
        when 'night_owl'      then v_hour between 0 and 4
        when 'books_finished' then v_books_finished >= coalesce(v_ach.criteria_value, 1)
        when 'books_added'    then v_total_books >= coalesce(v_ach.criteria_value, 5)
        else false
      end
    ) then
      insert into public.user_achievements (user_id, achievement_id)
      values (v_user_id, v_ach.id)
      on conflict do nothing;

      if found then
        v_new_achievements := array_append(v_new_achievements, v_ach.name);
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'xpGained', v_xp_gained,
    'newTotalXP', v_new_total_xp,
    'leveledUp', v_leveled_up,
    'newLevel', v_new_level,
    'newAchievements', to_jsonb(v_new_achievements)
  );
end;
$$;

-- Sinaliza ao PostgREST que o schema mudou. Sem isso, o REST API pode
-- continuar retornando 'Could not find the table' por minutos após o
-- CREATE TABLE — o cache só recarrega sob NOTIFY ou restart do container.
notify pgrst, 'reload schema';
