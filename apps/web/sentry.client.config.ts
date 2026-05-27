// Sentry — config do client (browser). Carregado pelo Sentry SDK na
// inicialização do app no navegador (via withSentryConfig).
//
// Se NEXT_PUBLIC_SENTRY_DSN não estiver setado, init() é no-op — útil em
// dev local e em PRs onde não queremos enviar eventos.

import * as Sentry from '@sentry/nextjs';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,

    // Em dev: amostra 100% pra debugar. Em prod: amostragem moderada;
    // app de hábito tem volume relativamente baixo, vale capturar mais.
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.3,

    // Replays — desligados por enquanto. Caro em storage e tem implicação
    // de privacidade (mascarar inputs com senhas/highlights). Ligar quando
    // houver um bug específico difícil de reproduzir.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Ambiente — útil pra filtrar erros de preview / prod.
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  });
}
