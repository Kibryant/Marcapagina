import type { Achievement, Book, ReadingSession } from '@marcapagina/shared';
import { generateStoryData, getStreak } from '@marcapagina/shared';
import { BookOpen, Calendar, Clock, Flame, Target } from 'lucide-react';
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

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('id, user_id, book_id, date, pages_read, duration_minutes, created_at')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  const { data: books } = await supabase
    .from('books')
    .select('id, status')
    .eq('user_id', user?.id);

  const sessionList = (sessions || []) as ReadingSession[];
  const bookList = (books || []) as Book[];

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true });

  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user?.id);

  const achievementList = (allAchievements || []) as Achievement[];
  const unlockedMap = new Map(
    (unlockedAchievements || []).map((ua) => [ua.achievement_id, ua.unlocked_at])
  );

  const storyData = generateStoryData(sessionList, bookList);
  const streak = getStreak(sessionList);

  const currentMonthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const unlockedCount = unlockedMap.size;

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
              description={streak > 0 ? 'Mantenha o fogo aceso.' : 'Comece hoje.'}
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
              value={storyData.bestDayName.replace(/^\w/, (c: string) => c.toUpperCase())}
              description="O dia da semana em que você mais lê."
              icon={<Calendar className="h-4 w-4" />}
            />
            <StoryCard
              title="Horário forte"
              value={storyData.bestTimeName.replace(/^\w/, (c: string) => c.toUpperCase())}
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
