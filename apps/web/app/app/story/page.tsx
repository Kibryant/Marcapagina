import {
  getProfile,
  listAchievements,
  listBookStatuses,
  listConsumedFreezeDates,
  listSessions,
  listUserAchievements,
} from '@marcapagina/data';
import { generateStoryData, getStreak } from '@marcapagina/shared';
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Sparkles,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { AchievementCard } from '@/components/achievement-card';
import { AppShell } from '@/components/app-shell';
import { ReadingCharts } from '@/components/reading-charts';
import { ReadingHeatmap } from '@/components/reading-heatmap';
import { StoryCard } from '@/components/story-card';
import { createClient } from '@/lib/supabase/server';

export default async function StoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const [
    profile,
    sessionList,
    bookStatuses,
    achievementList,
    unlockedAchievements,
    freezeDates,
  ] = await Promise.all([
    getProfile(supabase, userId),
    listSessions(supabase, userId),
    listBookStatuses(supabase, userId),
    listAchievements(supabase),
    listUserAchievements(supabase, userId),
    listConsumedFreezeDates(supabase, userId),
  ]);

  const unlockedMap = new Map(
    unlockedAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at])
  );

  const storyData = generateStoryData(sessionList, bookStatuses);
  const streak = getStreak(sessionList, freezeDates, {
    timezone: profile?.timezone,
  });

  const currentMonthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const unlockedCount = unlockedMap.size;
  const currentYear = new Date().getFullYear();

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sua História</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">
            {currentMonthLabel} · Relembre sua jornada literária.
          </p>
        </div>

        {/* Year in Books CTA */}
        <Link
          href={`/app/story/year/${currentYear}`}
          className="group flex items-center gap-4 p-5 rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 hover:border-primary/50 transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase tracking-widest text-primary">
              Retrospectiva {currentYear}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Veja o ano inteiro em um cartão. Compartilhável.
            </p>
          </div>
          <span className="text-xs font-bold text-primary shrink-0">
            Abrir →
          </span>
        </Link>

        {/* Section 1: Este Mês */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Este Mês
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <StoryCard
                title="Páginas lidas"
                value={`${storyData.currentMonthPages} páginas`}
                description={
                  storyData.lastMonthPages > 0
                    ? `${storyData.monthComparisonPercent > 0 ? 'Mais' : storyData.monthComparisonPercent < 0 ? 'Menos' : 'Igual'} do que no mês passado.`
                    : 'Seu primeiro mês com dados completos.'
                }
                icon={<BookOpen className="h-4 w-4" />}
                trend={
                  storyData.monthComparisonPercent > 0
                    ? 'up'
                    : storyData.monthComparisonPercent < 0
                      ? 'down'
                      : 'neutral'
                }
                trendValue={
                  storyData.lastMonthPages > 0
                    ? `${storyData.monthComparisonPercent > 0 ? '+' : ''}${storyData.monthComparisonPercent}%`
                    : undefined
                }
                highlight
              />
            </div>

            <StoryCard
              title="Dias lidos"
              value={`${storyData.uniqueDaysReadThisMonth} de ${storyData.daysPassedInMonth}`}
              description="Dias com leitura registrada neste mês."
              icon={<Target className="h-4 w-4" />}
            />

            <StoryCard
              title="Sequência atual"
              value={`${streak} ${streak === 1 ? 'dia' : 'dias'}`}
              description={
                streak > 0 ? 'Mantenha o fogo aceso.' : 'Comece hoje.'
              }
              icon={<Flame className="h-4 w-4" />}
            />

            <StoryCard
              title="Livros finalizados"
              value={storyData.finishedBooksCount}
              description={
                storyData.finishedBooksCount === 1
                  ? 'Uma história concluída.'
                  : storyData.finishedBooksCount > 1
                    ? `${storyData.finishedBooksCount} histórias concluídas.`
                    : 'Ainda nenhum livro finalizado.'
              }
              icon={<BookOpen className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Section 2: Seu Ritmo */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Seu Ritmo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StoryCard
              title="Dia favorito"
              value={storyData.bestDayName.replace(/^\w/, (c: string) =>
                c.toUpperCase()
              )}
              description="O dia da semana em que você mais lê."
              icon={<Calendar className="h-4 w-4" />}
            />
            <StoryCard
              title="Horário forte"
              value={storyData.bestTimeName.replace(/^\w/, (c: string) =>
                c.toUpperCase()
              )}
              description="O período do dia em que você acumula mais páginas."
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Section 3: Consistência */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Consistência
          </h2>
          <ReadingHeatmap sessions={sessionList} />
        </section>

        {/* Section 4: Evolução */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Evolução
          </h2>
          <ReadingCharts sessions={sessionList} />
        </section>

        {/* Section 5: Conquistas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Conquistas
            </h2>
            {achievementList.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {unlockedCount} de {achievementList.length} desbloqueadas
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementList.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedMap.has(achievement.id)}
                unlockedAt={unlockedMap.get(achievement.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
