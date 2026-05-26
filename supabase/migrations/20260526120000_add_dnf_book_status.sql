-- Adiciona status 'dnf' (did not finish / abandonado) ao conjunto de status
-- válidos de books. Livros abandonados ficavam presos em 'reading' e poluíam
-- o ritmo de leitura calculado (pacing, ETA, métricas mensais). Com 'dnf'
-- separado, eles deixam de pesar no cálculo sem precisar ser excluídos.
--
-- Reversível: o constraint volta ao conjunto antigo no rollback.

alter table public.books
  drop constraint if exists books_status_valid;

alter table public.books
  add constraint books_status_valid
  check (status = any (array['reading'::text, 'wishlist'::text, 'next'::text, 'finished'::text, 'dnf'::text]));

comment on constraint books_status_valid on public.books is
  'Status válidos: reading (em andamento), next (próximo), wishlist (lista de desejos), finished (concluído), dnf (abandonado).';
