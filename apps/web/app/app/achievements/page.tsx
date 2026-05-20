import type { Achievement } from '@marcapagina/shared';
import { Trophy } from 'lucide-react';
import { AchievementCard } from '@/components/achievement-card';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { createClient } from '@/lib/supabase/server';

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .order('criteria_value', { ascending: true });

  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user?.id);

  const unlockedMap = new Map(
    (userAchievements ?? []).map((ua) => [ua.achievement_id, ua.unlocked_at])
  );

  const all = (achievements ?? []) as Achievement[];
  const unlockedCount = all.filter((a) => unlockedMap.has(a.id)).length;
  const progress =
    all.length > 0 ? Math.round((unlockedCount / all.length) * 100) : 0;

  // Desbloqueadas primeiro (sort estável preserva a ordem por criteria_value).
  const sorted = [...all].sort(
    (a, b) => (unlockedMap.has(a.id) ? 0 : 1) - (unlockedMap.has(b.id) ? 0 : 1)
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conquistas 🏆</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Desbloqueie badges registrando leituras e mantendo o hábito.
          </p>
        </div>

        {all.length > 0 ? (
          <>
            <div className="rounded-2xl border bg-surface p-5 shadow-sm space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Progresso
                  </p>
                  <p className="text-2xl font-black tracking-tight">
                    {unlockedCount}
                    <span className="text-base font-bold text-muted-foreground">
                      {' '}
                      / {all.length}
                    </span>
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  {progress}%
                </span>
              </div>
              <ProgressBar value={progress} className="h-2" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sorted.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlockedMap.has(achievement.id)}
                  unlockedAt={unlockedMap.get(achievement.id) ?? undefined}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Trophy}
            title="Nenhuma conquista disponível"
            description="As conquistas ainda não foram configuradas. Volte em breve!"
          />
        )}
      </div>
    </AppShell>
  );
}
