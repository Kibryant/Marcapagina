// Sentry — config do edge runtime (middleware, edge functions).
// Carregado pelo instrumentation.ts quando NEXT_RUNTIME === 'edge'.

import * as Sentry from '@sentry/nextjs';

const DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.3,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}
