'use client';

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

const MIN_LENGTH = 8;

export default function NovaSenhaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Confirma que o link do email gerou uma sessão temporária. Sem isso,
  // updateUser falha — e o user nem tinha como chegar aqui.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setHasSession(!!user);
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`A senha precisa ter pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    // Pequeno delay pra usuário ver a confirmação antes de cair no app.
    setTimeout(() => {
      router.push('/app');
      router.refresh();
    }, 1500);
  };

  if (authChecked && !hasSession) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
        <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl">
          <CardHeader className="text-center pt-10">
            <CardTitle className="text-xl font-black">
              Link inválido ou expirado
            </CardTitle>
            <CardDescription className="text-sm mt-2">
              Tente pedir um novo link de recuperação.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-10">
            <Button asChild className="w-full rounded-xl">
              <Link href="/recuperar-senha">Pedir novo link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full" />

        <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-success" />
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tighter">
              Senha atualizada
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-2">
              Te levando pro app agora…
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />

      <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary/50 to-success/50" />

        <CardHeader className="space-y-4 pt-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">
              Nova senha
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Defina uma senha forte e fácil de lembrar.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-xl h-12 pr-10"
                  required
                  minLength={MIN_LENGTH}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">
                Mínimo {MIN_LENGTH} caracteres.
              </p>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirm"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                Confirmar
              </Label>
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-background/50 border-border/50 rounded-xl h-12"
                required
                minLength={MIN_LENGTH}
              />
            </div>
            {error && (
              <div className="text-xs font-bold p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-center">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="pb-10">
            <Button
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              type="submit"
              disabled={loading || !authChecked}
            >
              {loading ? (
                'Salvando…'
              ) : (
                <span className="flex items-center gap-2">
                  Salvar nova senha <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
