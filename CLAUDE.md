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

No test suite exists in this codebase.

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
XP and level logic lives in `apps/web/lib/xp.ts`. Formula: pages × 10 + minutes × 5. Achievement triggers fire via `processReadingXP()` after each session log.

### Shared Metric Functions (`packages/shared/`)
Pure functions consumed by both web and mobile: `getStreak()`, `getMonthPages()`, `getMonthPace()`, `getTodayPages()`, `getDailyGoalProgress()`. These must remain platform-agnostic.

### Key Conventions
- **Biome** is used for linting/formatting (not ESLint/Prettier for the most part). Single quotes in JS, double quotes in JSX. 2-space indent.
- **Tailwind CSS v4** — configured via PostCSS, no `tailwind.config.js`.
- **shadcn/ui** components live in `apps/web/components/ui/` — prefer editing these over replacing them.
- **Server Components by default** — only add `"use client"` when truly needed (event handlers, browser APIs, hooks).
- Book statuses: `reading | wishlist | next | finished`.
- Book categories (Portuguese): `ficção`, `não-ficção`, `tech`, `negócios`, `autoajuda`, `biografia`, `fantasia`, `romance`, `suspense`, `acadêmico`.

### Environment Variables
Configure in `apps/web/.env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
