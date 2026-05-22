# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Marcapágina** is a Portuguese-language reading habit tracker with gamification, social sharing, and cross-platform support (web + mobile). The codebase is a Turbo monorepo with npm workspaces.

## Commands

### Development
```bash
npm run dev          # Start all apps (web + mobile)
npm run web:dev      # Web app only (Next.js)
npm run mobile:dev   # Mobile app only (Expo)
```

### Building
```bash
npm run build        # Build all packages via Turbo
```

### Linting & Formatting
```bash
npm run lint         # Check with Biome
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Biome
```

### Testing
```bash
npm run test         # Run all unit tests via Turbo (Vitest)
npm run test:shared  # Shared package tests only
```
Unit tests use **Vitest**: pure logic in `packages/shared/__tests__/`, repository
tests (mocked Supabase client) in `packages/data/__tests__/`, XP helpers in
`apps/web/__tests__/`.

**E2E** uses **Playwright** (`apps/web/e2e/`) and runs against a **local
Supabase stack** — never production:
```bash
supabase start && supabase db reset   # local DB + seed (supabase/seed.sql)
cd apps/web && npm run e2e            # Playwright
```

## Architecture

### Monorepo Structure
- `apps/web/` — Next.js 16+ (App Router) web application
- `apps/mobile/` — Expo/React Native mobile application
- `packages/shared/` — Shared TypeScript types, interfaces, and metric calculation functions

The shared package is **not published to npm** — Next.js transpiles it directly via `next.config.ts`. Import it as `@marcapagina/shared`.

### Data Layer
All data access goes through the **Supabase client** directly — no ORM, no API routes. Pages fetch data server-side using `await createClient()` from `lib/supabase/server.ts`, and client components use `createClient()` from `lib/supabase/client.ts`.

Key tables: `profiles`, `books`, `reading_sessions`, `goals`, `achievements`, `user_achievements`, `highlights`.

### Authentication
Supabase Auth with `@supabase/ssr` for cookie-based session management. Protected routes live under `app/app/*`. The server client wraps cookies automatically — always use `lib/supabase/server.ts` in Server Components and `lib/supabase/client.ts` in Client Components.

### Gamification System
XP/level helper functions (formula: pages × 10 + minutes × 5, 1000 XP per level) live in `apps/web/lib/xp.ts`. Session logging, XP, level-up, and achievement processing run atomically server-side via the `log_reading_session` Postgres RPC (see `supabase/migrations/`).

### Shared Metric Functions (`packages/shared/`)
Pure functions consumed by both web and mobile: `getStreak()`, `getMonthPages()`, `getMonthPace()`, `getTodayPages()`, `getDailyGoalProgress()`. These must remain platform-agnostic.

### Key Conventions
- **Biome** is used for linting/formatting across the whole monorepo (no ESLint/Prettier). Single quotes in JS, double quotes in JSX. 2-space indent.
- **Tailwind CSS v4** — configured via PostCSS, no `tailwind.config.js`.
- **shadcn/ui** components live in `apps/web/components/ui/` — prefer editing these over replacing them.
- **Server Components by default** — only add `"use client"` when truly needed (event handlers, browser APIs, hooks).
- Book statuses: `reading | wishlist | next | finished`.
- Book categories (Portuguese): `ficção`, `não-ficção`, `tech`, `negócios`, `autoajuda`, `biografia`, `fantasia`, `romance`, `suspense`, `acadêmico`.

### Environment Variables
Configure in `apps/web/.env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

**`NEXT_PUBLIC_*` inlining gotcha:** Next.js only inlines *literal*
`process.env.NEXT_PUBLIC_X` references into the client bundle. Never pass the
whole `process.env` object to code that runs in the browser (e.g.
`schema.parse(process.env)`) — the keys come back `undefined` there.
`lib/client-env.ts` references each key explicitly for this reason.

## Security

- **Never commit secrets.** `.env`, `.env.local`, `*.key`, `*.pem` are
  gitignored and blocked from Claude's context by a hook. `.env.example` is
  safe to read and commit.
- **Supabase keys:** client code may only use the publishable key
  (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`). The `service_role` key
  must never reach the browser bundle.
- **Row Level Security:** every `public` table has RLS enabled and scoped to
  `auth.uid()`. Never trust a client-supplied `user_id`.
- **Gamification integrity:** the client must not write `profiles.xp`,
  `profiles.level` or `user_achievements` directly. All XP/level/achievement
  changes go through the `log_reading_session` Postgres RPC (`SECURITY
  DEFINER`); direct writes are revoked for the `authenticated` role.
- **Postgres functions:** always `set search_path = ''` with fully-qualified
  names. Use `SECURITY DEFINER` only when required, and validate `auth.uid()`
  plus row ownership inside.
- Use the `rls-security-review` skill before applying any database change.

## Claude Code Setup (`.claude/`)

`.claude/` is version-controlled — only `settings.local.json` and
`skills-lock.json` are gitignored.

- **`settings.json`** — shared permission allowlist/denylist and hooks.
- **Hooks** (`.claude/hooks/`):
  - `format.sh` — formats edited JS/TS/JSON/CSS files with Biome (PostToolUse).
  - `typecheck.sh` — runs `tsc --noEmit` on `apps/web` when a task ends (Stop).
  - `protect-sensitive.sh` — blocks reading/writing secret files (PreToolUse).
  - `guard-bash.sh` — blocks destructive shell commands (PreToolUse).
- **Skills** (`.claude/skills/`): `supabase-migration`, `scaffold-route`,
  `rls-security-review`.
- **Commands** (`.claude/commands/`): `/check` runs lint + type-check + tests.

### Conventions for Claude

- Run `/check` before committing.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- User-facing strings are in **Portuguese**; comments explaining "why" are
  welcome in Portuguese to match the codebase.
- Database migrations are **never auto-applied** — they are created in
  `supabase/migrations/` and applied manually by the user.
- Do not commit or push unless explicitly asked.
