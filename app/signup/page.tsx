"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Sparkles, ChevronLeft, ArrowRight, Mail } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-success/10 blur-[120px] rounded-full" />

        <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-success" />
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-4 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-success">Quase lá! 📚</CardTitle>
            <CardDescription className="text-sm font-medium mt-2">
              Verifique seu e-mail para confirmar seu cadastro e começar sua jornada.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-10">
            <Button className="w-full h-12 rounded-xl font-bold bg-success hover:bg-success/90 text-white" onClick={() => router.push("/login")}>
              Ir para o Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute -top-[10%] -right-[20%] w-[40%] h-[40%] bg-success/10 blur-[120px] rounded-full" />

      {/* Floating Back Button */}
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para o início
          </Link>
        </Button>
      </div>

      <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-success via-success/50 to-primary/50" />

        <CardHeader className="space-y-4 pt-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">Criar Conta</CardTitle>
            <CardDescription className="text-sm font-medium">
              Comece a organizar suas leituras hoje.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="ex@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 rounded-xl h-12 focus-visible:ring-success/20"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-xl h-12 pr-10 focus-visible:ring-success/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-xs font-bold p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-10">
            <Button className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-success/20 transition-all hover:shadow-success/30 bg-success hover:bg-success/90" type="submit" disabled={loading}>
              {loading ? "Criando..." : (
                <span className="flex items-center gap-2">
                  Começar Jornada <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-center text-muted-foreground font-medium">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-success font-bold hover:underline underline-offset-4">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>

      <p className="absolute bottom-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
        Cada página conta
      </p>
    </div>
  );
}
