---
name: supabase-migration
description: Use ao criar uma nova migração SQL do Supabase para o Marcapágina — nova tabela, coluna, índice, RPC, policy de RLS ou trigger. Garante o padrão do projeto (nome timestamped, search_path seguro, RLS, comentários, grants).
---

# Nova migração Supabase

Convenções para criar arquivos em `supabase/migrations/`.

## Nome do arquivo

`supabase/migrations/<YYYYMMDDHHMMSS>_<descricao_em_snake_case>.sql`

Gere o timestamp UTC atual com: `date -u +%Y%m%d%H%M%S`.

## Regras

- As migrações **não são aplicadas automaticamente**. Depois de criar o
  arquivo, avise o usuário para rodar `supabase db push` ou colar o SQL no
  SQL Editor do projeto correto.
- Comentários em português, explicando o "porquê" — não o "o quê".
- **Toda tabela nova**: habilitar RLS (`alter table ... enable row level
  security`) e criar policies escopadas por `auth.uid()`.
- **Funções** (`create function`): sempre `set search_path = ''` e
  referências totalmente qualificadas (`public.`, `auth.`).
- `SECURITY DEFINER` só quando a função precisa escrever além do que o RLS
  do usuário permite (ex.: XP, conquistas). Nesse caso, dentro da função:
  validar `auth.uid()` no início, conferir ownership das linhas tocadas e
  validar os inputs (faixas, nulos).
- `grant execute` explícito para `authenticated`; `revoke ... from public`
  quando o objeto não deve ser chamado por anônimos.

## Referência canônica

`supabase/migrations/20260520120000_add_log_reading_session_rpc.sql` é o
exemplo de uma RPC `SECURITY DEFINER` bem feita. Espelhe esse padrão.
