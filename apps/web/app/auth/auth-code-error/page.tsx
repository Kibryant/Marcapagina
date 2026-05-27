import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Erro ao entrar · Marcapágina',
};

export default function AuthCodeErrorPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-destructive/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-sm rounded-3xl border border-border/50 bg-surface/80 backdrop-blur-xl p-10 shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tighter">
            Não conseguimos te entrar
          </h1>
          <p className="text-sm text-muted-foreground">
            O link de autenticação expirou ou foi usado antes. Tenta de novo —
            se persistir, fala com a gente.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild className="rounded-xl h-12">
            <Link href="/login">Tentar entrar de novo</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xl h-12">
            <Link href="/">Voltar pro início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
