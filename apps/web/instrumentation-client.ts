// Instrumentation client do Next.js — equivalente do server-side mas no
// browser. Re-exporta o config do client e o hook do Sentry pra instrumentar
// navegações do App Router.

import * as Sentry from '@sentry/nextjs';
import './sentry.client.config';

// Necessário desde Sentry v8 + Next.js 15 pra rastrear transições de rota
// no App Router. No-op quando o Sentry não está inicializado.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
