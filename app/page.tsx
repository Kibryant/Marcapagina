import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Timer, TrendingUp, Sparkles, Shield, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Topbar */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Marcapágina</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
              <Link href="/signup">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto max-w-5xl px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="h-3.5 w-3.5" />
            Seu próximo capítulo começa aqui
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tighter sm:text-6xl lg:text-7xl leading-[1.1]">
            Não apenas leia. <br />
            <span className="text-primary">Evolua seu ritmo.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Acompanhe seu progresso, registre sessões com timer e descubra estatísticas
            surpreendentes sobre seu hábito de leitura.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg" asChild className="h-14 w-full rounded-2xl px-10 text-lg font-bold shadow-xl shadow-primary/25 sm:w-auto">
              <Link href="/signup">
                Começar agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 w-full rounded-2xl px-10 text-lg font-bold sm:w-auto">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          {/* Visual Placeholder for Dashboard */}
          <div className="relative mt-20 rounded-3xl border border-primary/10 bg-surface/50 p-4 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="absolute -inset-1 rounded-[2.2rem] bg-linear-to-tr from-primary/20 via-transparent to-success/20 opacity-50 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Hoje", value: "42", sub: "páginas", icon: BookOpen },
                { label: "No Mês", value: "840", sub: "páginas", icon: TrendingUp },
                { label: "Ritmo", value: "28", sub: "págs/dia", icon: Timer },
                { label: "Streak", value: "15", sub: "dias", icon: Sparkles },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-background/50 p-6 border border-border/50">
                  <stat.icon className="h-5 w-5 text-primary/60 mb-1" />
                  <span className="text-2xl font-black tabular-nums">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Mini Section */}
        <section className="container mx-auto max-w-5xl px-4 mt-32">
          <div className="grid gap-12 sm:grid-cols-3">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Timer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Foco & Tempo</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use o timer integrado para focar na leitura e registrar exatamente quanto tempo você dedica aos livros.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Métricas Visíveis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Acompanhe seu ritmo de leitura diário e mensal com gráficos limpos e fáceis de entender.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Dados são Seus</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Exporte todo o seu histórico a qualquer momento. Seus dados, sua privacidade, seu controle.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-surface/50 py-12">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Marcapágina. Feito para quem ama ler.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/login" className="hover:text-primary transition-colors">Entrar</Link>
            <Link href="/signup" className="hover:text-primary transition-colors">Criar Conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
