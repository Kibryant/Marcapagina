// Hook do Next.js para registrar instrumentação no boot do servidor.
// Carrega o Sentry no runtime correto (Node vs Edge).
// Ver: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Captura erros de Server Components, route handlers e middleware
// automaticamente. No-op quando o Sentry não está inicializado.
export const onRequestError = Sentry.captureRequestError;
