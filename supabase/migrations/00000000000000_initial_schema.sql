


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."apply_reading_session_to_book"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_total integer;
  v_current integer;
  v_new_current integer;
begin
  select total_pages, current_page
    into v_total, v_current
  from public.books
  where id = new.book_id
  for update;

  -- clamp: current_page não passa total_pages
  v_new_current := least(v_total, v_current + new.pages_read);

  update public.books
  set current_page = v_new_current,
      status = case
        when v_new_current >= v_total then 'finished'
        else status
      end
  where id = new.book_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."apply_reading_session_to_book"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_xp_gain"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_xp_gain integer;
begin
  v_xp_gain := (new.pages_read * 10) + (coalesce(new.duration_minutes, 0) * 5);
  
  update public.profiles
  set xp = xp + v_xp_gain
  where id = new.user_id;
  
  -- Lógica simples de level up (ex: cada 1000 XP sobe um nível)
  update public.profiles
  set level = floor(xp / 1000) + 1
  where id = new.user_id;
  
  return new;
end;
$$;


ALTER FUNCTION "public"."calculate_xp_gain"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_highlight_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_book_user uuid;
begin
  select user_id into v_book_user
  from public.books
  where id = new.book_id;

  if v_book_user is null then
    raise exception 'Book not found';
  end if;

  if new.user_id <> v_book_user then
    raise exception 'user_id mismatch: this book does not belong to the user';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_highlight_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_profile_favorite_book_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_book_user uuid;
begin
  if new.favorite_book_id is null then
    return new;
  end if;

  select user_id into v_book_user
  from public.books
  where id = new.favorite_book_id;

  if v_book_user is null then
    raise exception 'Favorite book not found';
  end if;

  if v_book_user <> new.id then
    raise exception 'favorite_book_id mismatch: this book does not belong to the user';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_profile_favorite_book_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_session_owner"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_book_user uuid;
begin
  select user_id into v_book_user
  from public.books
  where id = new.book_id;

  if v_book_user is null then
    raise exception 'Book not found';
  end if;

  if new.user_id <> v_book_user then
    raise exception 'user_id mismatch: this book does not belong to the user';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_session_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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


ALTER FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "criteria_type" "text" NOT NULL,
    "criteria_value" integer NOT NULL,
    "xp_reward" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "author" "text",
    "total_pages" integer NOT NULL,
    "current_page" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'wishlist'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rating" integer,
    "summary" "text",
    "category" "text",
    "cover_url" "text",
    CONSTRAINT "books_current_page_bounds" CHECK ((("current_page" >= 0) AND ("current_page" <= "total_pages"))),
    CONSTRAINT "books_rating_check" CHECK ((("rating" IS NULL) OR (("rating" >= 1) AND ("rating" <= 5)))),
    CONSTRAINT "books_status_valid" CHECK (("status" = ANY (ARRAY['reading'::"text", 'wishlist'::"text", 'next'::"text", 'finished'::"text"]))),
    CONSTRAINT "books_total_pages_positive" CHECK (("total_pages" > 0))
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "daily_pages" integer,
    "monthly_pages" integer,
    "suggested_daily_pages" integer,
    "suggested_monthly_pages" integer,
    "suggested_reason" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "goals_daily_positive" CHECK ((("daily_pages" IS NULL) OR ("daily_pages" > 0))),
    CONSTRAINT "goals_monthly_positive" CHECK ((("monthly_pages" IS NULL) OR ("monthly_pages" > 0))),
    CONSTRAINT "goals_suggested_daily_positive" CHECK ((("suggested_daily_pages" IS NULL) OR ("suggested_daily_pages" > 0))),
    CONSTRAINT "goals_suggested_monthly_positive" CHECK ((("suggested_monthly_pages" IS NULL) OR ("suggested_monthly_pages" > 0)))
);


ALTER TABLE "public"."goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."highlights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "page" integer,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "highlights_content_not_empty" CHECK (("length"(TRIM(BOTH FROM "content")) > 0)),
    CONSTRAINT "highlights_page_non_negative" CHECK ((("page" IS NULL) OR ("page" >= 0)))
);


ALTER TABLE "public"."highlights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "username" "text",
    "avatar_url" "text",
    "favorite_book_id" "uuid",
    "locale" "text" DEFAULT 'pt-BR'::"text" NOT NULL,
    "timezone" "text" DEFAULT 'America/Bahia'::"text" NOT NULL,
    "theme" "text" DEFAULT 'system'::"text" NOT NULL,
    "week_starts_on" integer DEFAULT 1 NOT NULL,
    "goal_pages_per_day" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "xp" integer DEFAULT 0 NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "is_public" boolean DEFAULT false,
    "social_settings" "jsonb" DEFAULT '{"show_streak": true, "show_total_pages": true, "show_favorite_book": true}'::"jsonb",
    CONSTRAINT "profiles_avatar_url_format" CHECK ((("avatar_url" IS NULL) OR ("avatar_url" ~ '^https?://'::"text"))),
    CONSTRAINT "profiles_goal_pages_positive" CHECK ((("goal_pages_per_day" IS NULL) OR ("goal_pages_per_day" > 0))),
    CONSTRAINT "profiles_theme_valid" CHECK (("theme" = ANY (ARRAY['light'::"text", 'dark'::"text", 'system'::"text"]))),
    CONSTRAINT "profiles_username_format" CHECK ((("username" IS NULL) OR ("username" ~ '^[a-z0-9_]{3,20}$'::"text"))),
    CONSTRAINT "profiles_week_starts_valid" CHECK ((("week_starts_on" >= 0) AND ("week_starts_on" <= 6)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "date" "date" DEFAULT (("now"() AT TIME ZONE 'utc'::"text"))::"date" NOT NULL,
    "pages_read" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration_minutes" integer DEFAULT 0,
    CONSTRAINT "reading_sessions_pages_positive" CHECK (("pages_read" > 0))
);


ALTER TABLE "public"."reading_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "achievement_id" "uuid",
    "unlocked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."reading_sessions"
    ADD CONSTRAINT "reading_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



CREATE INDEX "books_status_idx" ON "public"."books" USING "btree" ("status");



CREATE INDEX "books_user_id_idx" ON "public"."books" USING "btree" ("user_id");



CREATE INDEX "books_user_id_status_idx" ON "public"."books" USING "btree" ("user_id", "status");



CREATE UNIQUE INDEX "goals_one_active_per_user" ON "public"."goals" USING "btree" ("user_id") WHERE ("active" = true);



CREATE INDEX "goals_user_active_idx" ON "public"."goals" USING "btree" ("user_id", "active");



CREATE INDEX "goals_user_id_idx" ON "public"."goals" USING "btree" ("user_id");



CREATE INDEX "highlights_book_id_idx" ON "public"."highlights" USING "btree" ("book_id");



CREATE INDEX "highlights_user_id_idx" ON "public"."highlights" USING "btree" ("user_id");



CREATE INDEX "profiles_favorite_book_id_idx" ON "public"."profiles" USING "btree" ("favorite_book_id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "reading_sessions_book_id_idx" ON "public"."reading_sessions" USING "btree" ("book_id");



CREATE INDEX "reading_sessions_date_idx" ON "public"."reading_sessions" USING "btree" ("date");



CREATE INDEX "reading_sessions_user_id_idx" ON "public"."reading_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trg_apply_session_to_book" AFTER INSERT ON "public"."reading_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."apply_reading_session_to_book"();



CREATE OR REPLACE TRIGGER "trg_books_updated_at" BEFORE UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_calculate_xp_gain" AFTER INSERT ON "public"."reading_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_xp_gain"();



CREATE OR REPLACE TRIGGER "trg_enforce_highlight_owner" BEFORE INSERT OR UPDATE ON "public"."highlights" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_highlight_owner"();



CREATE OR REPLACE TRIGGER "trg_enforce_profile_favorite_book_owner" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_profile_favorite_book_owner"();



CREATE OR REPLACE TRIGGER "trg_enforce_session_owner" BEFORE INSERT OR UPDATE ON "public"."reading_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_session_owner"();



CREATE OR REPLACE TRIGGER "trg_goals_updated_at" BEFORE UPDATE ON "public"."goals" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_favorite_book_id_fkey" FOREIGN KEY ("favorite_book_id") REFERENCES "public"."books"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_sessions"
    ADD CONSTRAINT "reading_sessions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_sessions"
    ADD CONSTRAINT "reading_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public read on achievements" ON "public"."achievements" FOR SELECT USING (true);



CREATE POLICY "Anyone authenticated can view achievements" ON "public"."achievements" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can see public profiles" ON "public"."profiles" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can follow others" ON "public"."follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can insert own achievements" ON "public"."user_achievements" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can see who they follow" ON "public"."follows" FOR SELECT USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can unfollow" ON "public"."follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can view own unlocked achievements" ON "public"."user_achievements" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own achievements" ON "public"."user_achievements" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "books_delete_own" ON "public"."books" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "books_insert_own" ON "public"."books" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "books_select_own" ON "public"."books" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "books_update_own" ON "public"."books" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "goals_delete_own" ON "public"."goals" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "goals_insert_own" ON "public"."goals" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "goals_select_own" ON "public"."goals" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "goals_update_own" ON "public"."goals" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."highlights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "highlights_delete_own" ON "public"."highlights" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "highlights_insert_own" ON "public"."highlights" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "highlights_select_own" ON "public"."highlights" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "highlights_update_own" ON "public"."highlights" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_own" ON "public"."profiles" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."reading_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sessions_delete_own" ON "public"."reading_sessions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sessions_insert_own" ON "public"."reading_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "sessions_select_own" ON "public"."reading_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sessions_update_own" ON "public"."reading_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."apply_reading_session_to_book"() TO "anon";
GRANT ALL ON FUNCTION "public"."apply_reading_session_to_book"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_reading_session_to_book"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_xp_gain"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_xp_gain"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_xp_gain"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_highlight_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_highlight_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_highlight_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_profile_favorite_book_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_profile_favorite_book_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_profile_favorite_book_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_session_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_session_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_session_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_reading_session"("p_book_id" "uuid", "p_pages_read" integer, "p_duration_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";



GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";



GRANT ALL ON TABLE "public"."highlights" TO "anon";
GRANT ALL ON TABLE "public"."highlights" TO "authenticated";
GRANT ALL ON TABLE "public"."highlights" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("display_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("username") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("avatar_url") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("favorite_book_id") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("locale") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("timezone") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("theme") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("week_starts_on") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("goal_pages_per_day") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("is_public") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("social_settings") ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."reading_sessions" TO "anon";
GRANT ALL ON TABLE "public"."reading_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































