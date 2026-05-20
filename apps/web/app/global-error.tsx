'use client';

import { useEffect } from 'react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          background: '#ffffff',
          color: '#0a0a0a',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Algo deu muito errado.
        </h1>
        <p style={{ color: '#71717a', maxWidth: '28rem', margin: 0 }}>
          A aplicação encontrou um erro crítico. Tente recarregar a página.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#0a0a0a',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
