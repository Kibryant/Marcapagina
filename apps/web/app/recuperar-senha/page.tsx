'use client';

import { ArrowRight, ChevronLeft, KeyRound, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // O link no email aponta pra /auth/callback?next=/auth/nova-senha.
    // O callback troca o code por sessão e redireciona; com sessão ativa,
    // /auth/nova-senha permite trocar a senha via updateUser.
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/nova-senha')}`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (err) {
      // Não diferenciamos "email não existe" pra evitar enumeration —
      // sempre mostra sucesso.
      setError(err.message);
    }
    // Sucesso (ou erro silencioso) → mostra a confirmação.
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full" />

        <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-success" />
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4 shadow-inner">
              <MailCheck className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tighter">
              E-mail enviado
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-2">
              Se existe uma conta com esse e-mail, mandamos um link pra você
              definir uma nova senha. Confira a caixa de entrada e o spam.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-10 flex flex-col gap-3">
            <Button
              asChild
              className="w-full h-12 rounded-xl font-bold bg-success hover:bg-success/90 text-white"
            >
              <Link href="/login">Voltar para o login</Link>
            </Button>
            {error && (
              <p className="text-[10px] text-muted-foreground text-center">
                {error}
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-success/10 blur-[120px] rounded-full" />

      <div className="absolute top-8 left-8">
        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/login">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar pro login
          </Link>
        </Button>
      </div>

      <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary/50 to-success/50" />

        <CardHeader className="space-y-4 pt-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">
              Esqueceu a senha?
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Manda seu e-mail que enviamos um link pra trocar.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ex@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 rounded-xl h-12 focus-visible:ring-primary/20"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-10">
            <Button
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                'Enviando…'
              ) : (
                <span className="flex items-center gap-2">
                  Enviar link <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground font-medium">
              Lembrou da senha?{' '}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline underline-offset-4"
              >
                Voltar pro login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
