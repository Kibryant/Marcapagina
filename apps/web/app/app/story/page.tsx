import type { Achievement, Book, ReadingSession } from '@marcapagina/shared';
import { generateStoryData, getStreak } from '@marcapagina/shared';
import { BookOpen, Calendar, Clock, Target, Trophy } from 'lucide-react';
import { AchievementCard } from '@/components/achievement-card';
import { AppShell } from '@/components/app-shell';
import { ReadingHeatmap } from '@/components/reading-heatmap';
import { StoryCard } from '@/components/story-card';
import { createClient } from '@/lib/supabase/server';

export default async function StoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch current reading history
  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('id, user_id, book_id, date, pages_read, created_at')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  // Fetch books
  const { data: books } = await supabase
    .from('books')
    .select('id, status')
    .eq('user_id', user?.id);

  const sessionList = (sessions || []) as ReadingSession[];
  const bookList = (books || []) as Book[];

  // Fetch all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true });

  // Fetch user unlocked achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user?.id);

  const achievementList = (allAchievements || []) as Achievement[];
  const unlockedMap = new Map(
    (unlockedAchievements || []).map((ua) => [
      ua.achievement_id,
      ua.unlocked_at,
    ])
  );

  // Logic calculations
  const storyData = generateStoryData(sessionList, bookList);
  const streak = getStreak(sessionList);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sua História 📖</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Relembre sua jornada literária baseada nos seus registros reais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <div className="md:col-span-2 lg:col-span-3">
            <StoryCard
              title="Resumo do Mês"
              value={`${storyData.currentMonthPages} páginas`}
              description={`Neste mês você construiu mais um capítulo do seu hábito de leitura.`}
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
            title="Sua Consistência"
            value={`${storyData.uniqueDaysReadThisMonth} dias`}
            description={`Dias de leitura registrados nos primeiros ${storyData.daysPassedInMonth} dias do mês.`}
            icon={<Target className="h-4 w-4" />}
          />

          <StoryCard
            title="O Dia Favorito"
            value={storyData.bestDayName.replace(/^\w/, (c: string) =>
              c.toUpperCase()
            )}
            description="Seu desempenho máximo tende a acontecer com mais frequência neste dia."
            icon={<Calendar className="h-4 w-4" />}
          />

          <StoryCard
            title="Horário Forte"
            value={storyData.bestTimeName.replace(/^\w/, (c: string) =>
              c.toUpperCase()
            )}
            description={`Os dados mostram que você constrói o hábito melhor no período da ${storyData.bestTimeName}.`}
            icon={<Clock className="h-4 w-4" />}
          />

          <div className="md:col-span-2 lg:col-span-1 border-t md:border-t-0 pt-6 md:pt-0">
            <StoryCard
              title="Maior Sequência"
              value={`${streak} dias`}
              description="A sua persistência e vontade de prosseguir em chamas."
              icon={<Trophy className="h-4 w-4" />}
            />
          </div>

          <div className="md:col-span-1 lg:col-span-2 border-t md:border-t-0 pt-6 md:pt-0">
            <StoryCard
              title="Livros Finalizados"
              value={`${storyData.finishedBooksCount}`}
              description="Histórias concluídas com sucesso. Quantas vidas mais você quer viver dentro das páginas?"
              icon={<BookOpen className="h-4 w-4" />}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 pt-4">
            <ReadingHeatmap sessions={sessionList} />
          </div>

          {/* Achievements Section */}
          <div className="md:col-span-2 lg:col-span-3 pt-8 border-t border-dashed">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">
                Suas Conquistas
              </h2>
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}
