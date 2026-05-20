-- log_reading_session: registro de leitura atômico e processado no servidor.
--
-- Substitui o antigo processReadingXP() que rodava no browser. Antes, qualquer
-- usuário podia chamar a API direto e gravar XP/nível/conquistas arbitrários,
-- e o registro era feito em 3 escritas separadas (sessão, livro, perfil) que
-- podiam falhar pela metade. Esta função roda tudo numa única transação.

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

  -- Validação de entrada (fronteira do sistema).
  if p_pages_read is null or p_pages_read < 1 or p_pages_read > 10000 then
    raise exception 'pages_read deve estar entre 1 e 10000' using errcode = '22023';
  end if;

  if v_duration < 0 or v_duration > 1440 then
    raise exception 'duration_minutes deve estar entre 0 e 1440' using errcode = '22023';
  end if;

  -- Trava o livro e confirma que pertence ao usuário.
  select * into v_book
    from public.books
   where id = p_book_id and user_id = v_user_id
   for update;

  if not found then
    raise exception 'Livro não encontrado' using errcode = 'P0002';
  end if;

  v_new_page := least(v_book.total_pages, v_book.current_page + p_pages_read);
  v_is_finished := v_book.total_pages > 0 and v_new_page = v_book.total_pages;

  -- 1. Sessão de leitura.
  insert into public.reading_sessions
    (user_id, book_id, pages_read, duration_minutes, date)
  values
    (v_user_id, p_book_id, p_pages_read, v_duration, current_date);

  -- 2. Progresso do livro.
  update public.books
     set current_page = v_new_page,
         status = case when v_is_finished then 'finished' else status end
   where id = p_book_id;

  -- 3. XP e nível (fórmula: páginas × 10 + minutos × 5; 1000 XP por nível).
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

  -- 4. Conquistas.
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

  -- Streak: dias consecutivos lidos terminando hoje ou ontem (ilhas de datas).
  select coalesce(max(streak_len), 0) into v_streak
  from (
    select count(*) as streak_len, max(d) as end_d
    from (
      select d, d - (row_number() over (order by d))::integer as grp
      from (
        select distinct date as d
          from public.reading_sessions
         where user_id = v_user_id and date <= current_date
      ) distinct_dates
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
    if case v_ach.criteria_type
         when 'first_log'      then v_session_count >= 1
         when 'streak'         then v_streak >= coalesce(v_ach.criteria_value, 3)
         when 'pages_day'      then v_pages_today >= coalesce(v_ach.criteria_value, 100)
         when 'night_owl'      then v_hour between 0 and 4
         when 'books_finished' then v_books_finished >= coalesce(v_ach.criteria_value, 1)
         when 'books_added'    then v_total_books >= coalesce(v_ach.criteria_value, 5)
         else false
       end
    then
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

-- Só usuários autenticados podem chamar.
revoke all on function public.log_reading_session(uuid, integer, integer) from public;
grant execute on function public.log_reading_session(uuid, integer, integer) to authenticated;
