-- Grava reading_sessions.date na timezone do usuário (não em UTC).
--
-- Antes desta migração, a RPC log_reading_session usava `current_date` —
-- que respeita a TZ do processo Postgres (UTC no Supabase). Para um usuário
-- em São Paulo (UTC-3) que registra leitura às 22h do dia 14, o Postgres
-- gravava `2026-05-15` porque já era depois da meia-noite em UTC. Isso
-- desalinhava o "hoje" do app com o "hoje" do banco, gerando ranges de
-- streak/meta diária incorretos perto da virada do dia.
--
-- A correção: extraímos a data corrente já convertida para a TZ do profile
-- e usamos esse valor em todas as escritas e consultas dentro da RPC. As
-- mesmas regras de streak (datas + freezes consumidos) continuam, só que
-- ancoradas no `v_today` do usuário.

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
  v_today            date;
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

  select * into v_profile
    from public.profiles
   where id = v_user_id
   for update;

  -- "Hoje" do ponto de vista do usuário — não do servidor Postgres.
  v_timezone := coalesce(v_profile.timezone, 'America/Sao_Paulo');
  v_today := (now() at time zone v_timezone)::date;

  insert into public.reading_sessions
    (user_id, book_id, pages_read, duration_minutes, date)
  values
    (v_user_id, p_book_id, p_pages_read, v_duration, v_today);

  update public.books
     set current_page = v_new_page,
         status = case when v_is_finished then 'finished' else status end
   where id = p_book_id;

  v_xp_gained := p_pages_read * 10 + v_duration * 5;

  v_new_total_xp := coalesce(v_profile.xp, 0) + v_xp_gained;
  v_new_level := floor(v_new_total_xp / 1000) + 1;
  v_leveled_up := v_new_level > coalesce(v_profile.level, 1);

  update public.profiles
     set xp = v_new_total_xp,
         level = v_new_level
   where id = v_user_id;

  -- Auto-grant: 1 freeze por mês na TZ do usuário também.
  insert into public.streak_freezes (user_id, granted_for_month)
  values (v_user_id, date_trunc('month', v_today)::date)
  on conflict (user_id, granted_for_month) do nothing;

  v_hour := extract(hour from (now() at time zone v_timezone))::integer;

  select coalesce(sum(pages_read), 0) into v_pages_today
    from public.reading_sessions
   where user_id = v_user_id and date = v_today;

  select count(*) into v_session_count
    from public.reading_sessions
   where user_id = v_user_id;

  select count(*) into v_total_books
    from public.books
   where user_id = v_user_id;

  select count(*) into v_books_finished
    from public.books
   where user_id = v_user_id and status = 'finished';

  select coalesce(max(streak_len), 0) into v_streak
  from (
    select count(*) as streak_len, max(d) as end_d
    from (
      select d, d - (row_number() over (order by d))::integer as grp
      from (
        select date as d
          from public.reading_sessions
         where user_id = v_user_id and date <= v_today
        union
        select consumed_for_date as d
          from public.streak_freezes
         where user_id = v_user_id
           and consumed_for_date is not null
           and consumed_for_date <= v_today
      ) all_dates
      group by d
    ) islands
    group by grp
  ) streaks
  where end_d >= v_today - 1;

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

-- Também passamos a aceitar consume_streak_freeze para datas relativas à
-- TZ do usuário. A janela de "últimos 2 dias" pode pular fronteira de UTC
-- quando avaliada em UTC; ancorar em v_today resolve.
create or replace function public.consume_streak_freeze(p_date date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id     uuid := auth.uid();
  v_freeze_id   uuid;
  v_has_session boolean;
  v_has_freeze  boolean;
  v_timezone    text;
  v_today       date;
begin
  if v_user_id is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  if p_date is null then
    raise exception 'p_date é obrigatório' using errcode = '22023';
  end if;

  select coalesce(timezone, 'America/Sao_Paulo') into v_timezone
    from public.profiles where id = v_user_id;
  v_today := (now() at time zone coalesce(v_timezone, 'America/Sao_Paulo'))::date;

  if p_date >= v_today then
    raise exception 'Não dá pra usar freeze para hoje ou no futuro'
      using errcode = '22023';
  end if;

  if p_date < v_today - 2 then
    raise exception 'Freeze só cobre os últimos 2 dias'
      using errcode = '22023';
  end if;

  select exists(
    select 1 from public.reading_sessions
     where user_id = v_user_id and date = p_date
  ) into v_has_session;

  if v_has_session then
    raise exception 'Esse dia já tem leitura registrada' using errcode = '22023';
  end if;

  select exists(
    select 1 from public.streak_freezes
     where user_id = v_user_id and consumed_for_date = p_date
  ) into v_has_freeze;

  if v_has_freeze then
    raise exception 'Esse dia já está coberto por um freeze' using errcode = '22023';
  end if;

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

notify pgrst, 'reload schema';
