import { startOfMonth, isAfter, subDays, format } from "date-fns";

export interface ReadingSession {
  date: string;
  pages_read: number;
}

export function getTodayPages(sessions: ReadingSession[]): number {
  const today = format(new Date(), "yyyy-MM-dd");
  return sessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.pages_read, 0);
}

export function getMonthPages(sessions: ReadingSession[]): number {
  const start = startOfMonth(new Date());
  return sessions
    .filter((s) => {
      const sessionDate = new Date(s.date + "T00:00:00");
      return !isAfter(start, sessionDate);
    })
    .reduce((acc, s) => acc + s.pages_read, 0);
}

export function getMonthPace(monthPages: number): number {
  const today = new Date();
  const dayOfMonth = today.getDate();
  return Number((monthPages / dayOfMonth).toFixed(1));
}

export function getStreak(sessions: ReadingSession[]): number {
  if (sessions.length === 0) return 0;

  // Group by date and sum pages
  const dailyTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    dailyTotals[s.date] = (dailyTotals[s.date] || 0) + s.pages_read;
  });

  let streak = 0;
  let currentDate = new Date();
  const todayStr = format(currentDate, "yyyy-MM-dd");

  // If today has no reading, we start checking from yesterday
  if ((dailyTotals[todayStr] || 0) === 0) {
    currentDate = subDays(currentDate, 1);
  }

  while (true) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    if ((dailyTotals[dateStr] || 0) > 0) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getDailyGoalProgress(todayPages: number, goal: number | null): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((todayPages / goal) * 100));
}
