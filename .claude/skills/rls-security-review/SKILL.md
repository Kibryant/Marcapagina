---
name: rls-security-review
description: Use ao revisar migrações, RPCs ou queries Supabase do Marcapágina, ou antes de aplicar mudanças no banco. Audita RLS, SECURITY DEFINER e escrita indevida de dados sensíveis (XP, conquistas, segredos).
---

# Revisão de RLS / Segurança Supabase

Checklist ao revisar qualquer acesso a dados.

## Row Level Security

- [ ] Toda tabela em `public` tem RLS habilitado.
- [ ] Policies escopadas por `auth.uid()` — o usuário só lê/escreve as
      próprias linhas.
- [ ] Nada confia em `user_id` vindo do cliente sem checar contra
      `auth.uid()`.

## Funções

- [ ] `set search_path = ''` em toda função, com referências qualificadas.
- [ ] `SECURITY DEFINER` apenas quando necessário; com checagem de
      `auth.uid()`, ownership das linhas e validação de inputs.
- [ ] `grant`/`revoke` coerentes com a intenção.

## Gamificação (regra do projeto)

- [ ] O cliente **não** escreve `profiles.xp`, `profiles.level` nem
      `user_achievements` diretamente — apenas via a RPC
      `log_reading_session`.
- [ ] As permissões negam escrita direta de XP/conquistas para o role
      `authenticated` (ver migração `harden_xp_write_access`).

## Segredos

- [ ] Nenhuma `service_role key` no código do cliente — só a publishable
      key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`).
- [ ] Env vars `NEXT_PUBLIC_*` referenciadas por chave literal (ver a
      seção de Segurança no CLAUDE.md).
