-- =========================================================
-- Marcapagina - Book Rating
-- Adiciona coluna `rating` (1–5) à tabela books
-- Cole no Supabase SQL Editor e execute.
-- =========================================================

alter table public.books
  add column if not exists rating integer
    check (rating is null or (rating >= 1 and rating <= 5));
