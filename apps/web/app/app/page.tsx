import {
  getMonthPace,
  getMonthPages,
  getStreak,
  getTodayPages,
} from '@marcapagina/shared/metrics';
import {
  BookPlus,
  Calendar,
  Flame,
  Lightbulb,
  Moon,
  Plus,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { BookCard } from '@/components/book-card';
import { CategoryBreakdown } from '@/components/category-breakdown';
import { DailyGoal } from '@/components/daily-goal';
import { EmptyState } from '@/components/empty-state';
import { MonthlyChart } from '@/components/monthly-chart';
import { StatTile } from '@/components/stat-tile';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getAllInsights } from '@/lib/insights';
import {
  getBookRecommendations,
  getHabitRecommendations,
} from '@/lib/recommendations';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  // Fetch books
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  // Fetch sessions
  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  const activeBooks = books?.filter((b) => b.status === 'reading') || [];
  const sessionList = sessions || [];

  // Metrics
  const todayPages = getTodayPages(sessionList);
  const monthPages = getMonthPages(sessionList);
  const rhythm = getMonthPace(monthPages);
  const streak = getStreak(sessionList);

  // Insights & Recommendations
  const userInsights = getAllInsights(sessionList || []);
  const habitRecs = getHabitRecommendations(userInsights);
  const bookRecs = getBookRecommendations(books || []);
  const allRecommendations = [...habitRecs, ...bookRecs];

  // XP Progress
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpToNextLevel = 1000;
  const xpProgress = Math.round(((xp % xpToNextLevel) / xpToNextLevel) * 100);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header/Greeting - Full Width */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Oi, {profile?.display_name || 'Leitor'}! 📚
            </h1>
            <p className="text-muted-foreground text-sm">
              Pronto para mais um capítulo?
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                Nível
              </span>
              <span className="text-lg font-black leading-none">{level}</span>
            </div>
            <div className="w-24 space-y-1">
              <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase">
                <span>XP</span>
                <span>
                  {xp % xpToNextLevel} / {xpToNextLevel}
                </span>
              </div>
              <ProgressBar value={xpProgress} className="h-1 bg-primary/10" />
            </div>
          </div>
        </div>

        {/* Streak At Risk Banner */}
        {todayPages === 0 && streak > 0 && (
          <Link
            href="/app/log"
            className="group flex items-center gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-500">
                {streak >= 7
                  ? `Sua sequência de ${streak} dias está em risco! 🔥`
                  : streak >= 3
                    ? `${streak} dias seguidos! Não pare agora! 🔥`
                    : `Mantenha seu streak de ${streak} dia${streak > 1 ? 's' : ''}! 🔥`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registre pelo menos uma página hoje para manter a sequência.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 shrink-0 hidden sm:block">
              Ler agora →
            </span>
          </Link>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Column */}
          <div className="space-y-8">
            {/* v2: Daily Goal */}
            {profile?.goal_pages_per_day && (
              <DailyGoal
                currentPages={todayPages}
                goal={profile.goal_pages_per_day}
              />
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label="Hoje" value={todayPages} subtext="páginas" />
              <StatTile label="No Mês" value={monthPages} subtext="páginas" />
              <StatTile label="Ritmo" value={rhythm} subtext="págs/dia" />
              <StatTile label="Streak" value={streak} subtext="dias seguidos" />
            </div>

            {/* CTA */}
            <Button
              asChild
              size="lg"
              className="h-14 w-full text-base font-semibold rounded-xl lg:h-12 lg:text-sm"
            >
              <Link href="/app/log">
                <Plus className="mr-2 h-5 w-5 lg:h-4 lg:w-4" /> Registrar
                Leitura
              </Link>
            </Button>

            {/* Active Books */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Lendo agora</h2>
                <Link
                  href="/app/books"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {activeBooks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {activeBooks.slice(0, 3).map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      current_page={book.current_page}
                      total_pages={book.total_pages}
                      status={book.status}
                      cover_url={book.cover_url}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookPlus}
                  title="Nenhum livro em leitura"
                  description="Adicione um livro para começar a rastrear seu progresso."
                  actionLabel="Adicionar livro"
                  actionHref="/app/books/new"
                />
              )}
            </section>
          </div>

          {/* Right Column / Sidebar Insights */}
          <aside className="space-y-8 lg:sticky lg:top-8">
            {/* Category Breakdown */}
            <CategoryBreakdown books={books || []} />

            {/* v3: Insights & Tips Section */}
            {(userInsights.length > 0 || allRecommendations.length > 0) && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Insights & Dicas
                  </h2>
                </div>

                <div className="space-y-3">
                  {userInsights.slice(0, 2).map((insight) => {
                    const Icon =
                      insight.icon === 'Moon'
                        ? Moon
                        : insight.icon === 'Sun'
                          ? Sun
                          : insight.icon === 'Calendar'
                            ? Calendar
                            : insight.icon === 'TrendingUp'
                              ? TrendingUp
                              : Sparkles;

                    return (
                      <div
                        key={`${insight.title}-${insight.description}`}
                        className="rounded-2xl border bg-surface p-4 space-y-2 shadow-sm border-primary/20 bg-primary/2"
                      >
                        <div className="flex items-center gap-2 text-primary">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Insight
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-tight">
                          {insight.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    );
                  })}

                  {allRecommendations.slice(0, 2).map((recommendation) => (
                    <div
                      key={`${recommendation.title}-${recommendation.description}`}
                      className="rounded-2xl border bg-surface p-4 space-y-2 shadow-sm border-success/20 bg-success/2"
                    >
                      <div className="flex items-center gap-2 text-success">
                        <Lightbulb className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Dica
                        </span>
                      </div>
                      <h3 className="font-bold text-sm leading-tight">
                        {recommendation.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {recommendation.description}
                      </p>
                      {recommendation.actionLabel && (
                        <Link
                          href={recommendation.actionHref || '#'}
                          className="text-xs font-bold text-success hover:underline inline-block pt-1"
                        >
                          {recommendation.actionLabel} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* v2: Monthly Chart */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mensal</h2>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Págs / Dia
                </div>
              </div>
              <div className="rounded-2xl border bg-surface p-4 shadow-sm overflow-hidden">
                <div className="-mx-2">
                  <MonthlyChart sessions={sessionList} />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
