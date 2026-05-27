import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@marcapagina/shared', '@marcapagina/data'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
    ],
  },
};

// Sentry: org/project/auth-token via env. Sem as três, o upload de
// source maps é pulado silenciosamente, mas o SDK continua capturando
// erros em runtime (apenas com stack traces minificados).
//
// Recomendado em prod (Vercel):
//   SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN, NEXT_PUBLIC_SENTRY_DSN
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Só faz log de upload em CI; em dev fica silencioso.
  silent: !process.env.CI,

  // Tunnel pra escapar de ad-blockers — habilita só em produção, em uma
  // rota reservada do app. Mantém erros sendo reportados mesmo com uBlock.
  tunnelRoute: '/monitoring',
});
