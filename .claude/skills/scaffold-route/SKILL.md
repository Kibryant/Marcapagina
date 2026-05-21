---
name: scaffold-route
description: Use ao criar uma nova rota dentro de /app no app web (apps/web/app/app/*). Segue o padrão do projeto — server component com AppShell, loading.tsx com skeleton e link na navegação.
---

# Nova rota /app

## Estrutura de arquivos

- `apps/web/app/app/<rota>/page.tsx` — a página (server component).
- `apps/web/app/app/<rota>/loading.tsx` — o skeleton de carregamento.

## page.tsx

- **Server Component por padrão** — sem `'use client'`.
- Buscar dados no servidor com `await createClient()` de
  `@/lib/supabase/server` e `supabase.auth.getUser()`.
- Envolver o conteúdo em `<AppShell>`.
- Precisa de interatividade (estado, handlers, hooks)? Extraia um
  componente `*-client.tsx` com `'use client'` e passe os dados por props.
  Veja `apps/web/app/app/goals/` (page.tsx + goals-client.tsx).

## loading.tsx

- `export default function Loading()` renderizando `<AppShell>` +
  componentes `<Skeleton>` (de `@/components/ui/skeleton`), espelhando o
  layout real da página para evitar layout shift.

## Navegação

- Se a rota for de topo, adicione um item em `navItems` no
  `apps/web/components/app-shell.tsx` (label em português, ícone do
  `lucide-react`).

## Referência canônica

`apps/web/app/app/achievements/` é um exemplo completo e recente do padrão.
