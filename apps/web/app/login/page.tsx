"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, BookOpen, ChevronLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      setLoading(false);
    } else {
      router.push("/app");
      router.refresh();
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-success/10 blur-[120px] rounded-full" />

      {/* Floating Back Button */}
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para o início
          </Link>
        </Button>
      </div>

      <Card className="relative w-full max-w-sm bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary/50 to-success/50" />

        <CardHeader className="space-y-4 pt-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">Entrar</CardTitle>
            <CardDescription className="text-sm font-medium">
              Bem-vindo de volta! Continue sua leitura.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-xl h-12 pr-10 focus-visible:ring-primary/20"
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
            <Button className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30" type="submit" disabled={loading}>
              {loading ? "Entrando..." : (
                <span className="flex items-center gap-2">
                  Entrar no Sistema <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-center text-muted-foreground font-medium">
                Novo por aqui?{" "}
                <Link href="/signup" className="text-primary font-bold hover:underline underline-offset-4">
                  Criar conta agora
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>

      <p className="absolute bottom-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
        Pronto para o próximo capítulo
      </p>
    </div>
  );
}
