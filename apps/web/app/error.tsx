'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-destructive/20 blur-3xl rounded-full" />
        <AlertTriangle className="h-24 w-24 text-destructive relative" />
      </div>

      <h1 className="text-4xl font-black tracking-tighter mb-4 sm:text-5xl">
        Algo deu errado.
      </h1>

      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Encontramos um erro inesperado. Tente novamente — se o problema
        continuar, recarregue a página.
      </p>

      <Button
        onClick={reset}
        size="lg"
        className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20"
      >
        <RotateCw className="h-5 w-5" /> Tentar de novo
      </Button>

      <p className="mt-20 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
        Erro • Marcapágina
      </p>
    </div>
  );
}
