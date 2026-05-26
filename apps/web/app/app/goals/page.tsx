import { getActiveGoal, getProfile, listSessions } from '@marcapagina/data';
import { calculateGoalsSuggestions } from '@marcapagina/shared';
import { getMonthPages, getTodayPages } from '@marcapagina/shared/metrics';
import { AppShell } from '@/components/app-shell';
import { createClient } from '@/lib/supabase/server';
import { GoalsClient } from './goals-client';

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? '';
  const [profile, sessionList, activeGoal] = await Promise.all([
    getProfile(supabase, userId),
    listSessions(supabase, userId),
    getActiveGoal(supabase, userId),
  ]);

  const tzOpts = { timezone: profile?.timezone };
  const todayPages = getTodayPages(sessionList, tzOpts);
  const currentMonthPages = getMonthPages(sessionList, tzOpts);

  // Generate algorithmic suggestion based on the last 14 days
  const suggestion = calculateGoalsSuggestions(sessionList, currentMonthPages);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suas Metas 🎯</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Consistência é o segredo para construir o hábito de leitura.
          </p>
        </div>

        <GoalsClient
          currentPages={todayPages}
          currentMonthPages={currentMonthPages}
          goal={activeGoal}
          suggestion={suggestion}
        />
      </div>
    </AppShell>
  );
}
