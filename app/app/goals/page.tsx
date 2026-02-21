import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { getTodayPages, getMonthPages } from "@/lib/metrics";
import { calculateGoalsSuggestions, ReadingSession } from "@/lib/utils";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch current reading history
  const { data: sessions } = await supabase
    .from("reading_sessions")
    .select("id, user_id, book_id, date, pages_read, created_at")
    .eq("user_id", user?.id)
    .order("date", { ascending: false });

  // Fetch active goal
  const { data: activeGoal } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user?.id)
    .eq("active", true)
    .single();

  const sessionList = (sessions || []) as ReadingSession[];

  const todayPages = getTodayPages(sessionList);
  const currentMonthPages = getMonthPages(sessionList);

  // Generate algorithmic suggestion based on the last 14 days
  const suggestion = calculateGoalsSuggestions(sessionList, currentMonthPages);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suas Metas Diárias 🎯</h1>
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
