import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Timer, TrendingUp, Sparkles, Shield, ArrowRight, Quote, CheckCircle2, Star } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-70 animate-pulse duration-1000" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[128px] opacity-50" />
      </div>

      {/* Topbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              Marcapágina
            </span>
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

      <main className="pt-32 pb-20 relative">
        {/* Hero Section */}
        <section className="container mx-auto max-w-5xl px-4 text-center space-y-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-black uppercase tracking-widest text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_15px_rgba(var(--primary),0.2)] backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Seu próximo capítulo começa aqui</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tighter sm:text-6xl lg:text-8xl leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            Não apenas leia. <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-sky-500 animate-gradient-x">
              Evolua seu ritmo.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-2xl font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Acompanhe seu progresso, registre sessões com timer e descubra estatísticas
            surpreendentes sobre seu hábito de leitura.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Button size="lg" asChild className="h-16 w-full rounded-full px-10 text-lg font-bold shadow-2xl shadow-primary/40 sm:w-auto relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-primary/60">
              <Link href="/signup">
                <span className="relative z-10 flex items-center">
                  Começar agora <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-16 w-full rounded-full px-10 text-lg font-bold sm:w-auto border-border/50 bg-background/50 backdrop-blur-md hover:bg-background/80 transition-all">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          {/* Interactive Mockup (Glassmorphism Dashboard) */}
          <div className="relative mt-24 mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
            {/* Glow Behind Mockup */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-linear-to-tr from-primary/30 via-purple-500/20 to-sky-500/30 opacity-70 blur-3xl animate-pulse" />

            {/* Fake Browser/App Window */}
            <div className="relative rounded-3xl border border-white/10 bg-background/40 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 sm:p-6 overflow-hidden">

              {/* Window Controls */}
              <div className="flex gap-2 mb-6 px-2">
                <div className="h-3 w-3 rounded-full bg-red-400/50" />
                <div className="h-3 w-3 rounded-full bg-amber-400/50" />
                <div className="h-3 w-3 rounded-full bg-green-400/50" />
              </div>

              {/* Inside Dashboard Fake */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6 text-left">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Oi, Leitor! 👋</h3>
                    <p className="text-xs text-muted-foreground">O que você vai ler hoje?</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Hoje", value: "42", sub: "págs" },
                      { label: "No Mês", value: "840", sub: "págs" },
                      { label: "Ritmo", value: "28", sub: "p/dia" },
                      { label: "Streak", value: "15", sub: "dias" },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col rounded-xl bg-background/60 p-4 border border-border/40 shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                        <span className="text-2xl font-black">{stat.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fake Book Card */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex gap-4 items-center">
                    <div className="w-12 h-16 rounded shadow-md bg-linear-to-br from-indigo-500 to-purple-600 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="text-sm font-bold">Hábitos Atômicos</div>
                        <div className="text-xs text-muted-foreground">James Clear</div>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[45%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Fake */}
                <div className="hidden md:block space-y-4">
                  <div className="p-4 rounded-xl border border-border/40 bg-background/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                      <Sparkles className="h-3 w-3" /> Insights
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Você lê 30% mais rápido nas noites de Quarta-feira. Continue o ótimo ritmo!
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/40 bg-background/60 space-y-3">
                    <div className="h-24 w-full rounded flex items-end gap-1 opacity-50">
                      <div className="w-1/4 bg-primary/40 h-1/2 rounded-t-sm" />
                      <div className="w-1/4 bg-primary/60 h-3/4 rounded-t-sm" />
                      <div className="w-1/4 bg-primary/80 h-full rounded-t-sm" />
                      <div className="w-1/4 bg-primary h-2/3 rounded-t-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Row (Cards with Hover effects) */}
        <section className="container mx-auto max-w-5xl px-4 mt-40">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-black sm:text-4xl">Ferramentas para quem leva a sério.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Tudo que você precisa para metrificar, visualizar e se apaixonar novamente pela leitura constante.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { title: "Foco & Tempo", icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50 hover:shadow-amber-500/20", desc: "Use o timer integrado para focar na leitura e registrar exatamente quanto tempo você dedica aos livros." },
              { title: "Métricas Visíveis", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary/50 hover:shadow-primary/20", desc: "Acompanhe seu ritmo de leitura diário e mensal com gráficos limpos e inteligentes." },
              { title: "Seus Dados", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50 hover:shadow-emerald-500/20", desc: "Exporte todo o seu histórico a qualquer momento. Seus dados, sua privacidade, seu total controle." }
            ].map((Feature, i) => (
              <div key={i} className={`group relative p-8 rounded-3xl border border-border/50 bg-surface/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${Feature.border} overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${Feature.bg.replace("/10", "")}`} />
                <div className="relative space-y-5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${Feature.bg} ${Feature.color}`}>
                    <Feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold">{Feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {Feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials (Social Proof) */}
        <section className="container mx-auto max-w-5xl px-4 mt-40">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-12 relative overflow-hidden backdrop-blur-sm">
            <Quote className="absolute -top-4 -right-4 h-32 w-32 text-primary/5 -rotate-12" />
            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-black mb-4">Leia mais, esqueça menos.</h2>
                <p className="text-muted-foreground text-lg mb-8">Junte-se a leitores que transformaram o hábito de ler em uma atividade metrificada e divertida.</p>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-bold mt-2">Avaliação 5/5 de nossos usuários</p>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Mariana Souza", review: "Finalmente algo que me motiva a ler todos os dias sem me sentir pressionada. As metas dinâmicas são geniais." },
                  { name: "Lucas Ferreira", review: "Eu amo os gráficos mensais. Ver meu 'streak' crescendo me força a abrir pelo menos 10 páginas antes de dormir." }
                ].map((t, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-background shadow-md border border-border/40">
                    <p className="text-sm italic mb-4">&quot;{t.review}&quot;</p>
                    <p className="text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> {t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-16">
        <div className="container mx-auto max-w-5xl px-4 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-black tracking-tighter">Marcapágina</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 Marcapágina. Feito para quem ama ler.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            <Link href="/signup" className="hover:text-primary transition-colors">Criar Conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
