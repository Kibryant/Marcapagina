-- =========================================================
-- Marcapagina V4 (SEM NOTIFICAÇÕES) - Goals
-- Cole no Supabase SQL Editor e execute.
-- =========================================================
begin;

create extension if not exists "pgcrypto";

-- Tabela goals (1 registro ativo por usuário)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  daily_pages integer,
  monthly_pages integer,

  suggested_daily_pages integer,
  suggested_monthly_pages integer,
  suggested_reason text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint goals_daily_positive check (daily_pages is null or daily_pages > 0),
  constraint goals_monthly_positive check (monthly_pages is null or monthly_pages > 0),
  constraint goals_suggested_daily_positive check (suggested_daily_pages is null or suggested_daily_pages > 0),
  constraint goals_suggested_monthly_positive check (suggested_monthly_pages is null or suggested_monthly_pages > 0)
);

create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists goals_user_active_idx on public.goals(user_id, active);

-- Garante no máximo 1 goal ativo por usuário
create unique index if not exists goals_one_active_per_user
  on public.goals(user_id)
  where active = true;

-- updated_at trigger (reutiliza se já existir no seu schema)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

-- RLS
alter table public.goals enable row level security;

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals for select
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals for insert
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own"
on public.goals for delete
using (auth.uid() = user_id);

commit;
