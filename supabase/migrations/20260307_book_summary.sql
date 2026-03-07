-- =========================================================
-- Marcapagina - Book Summary
-- Adiciona coluna `summary` à tabela books
-- =========================================================

alter table public.books
  add column if not exists summary text;
