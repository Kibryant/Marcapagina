import { format, parseISO, startOfMonth, subDays } from 'date-fns';
import { type DateOptions, getTodayDateString } from './date-utils';

export interface ReadingSession {
  date: string;
  pages_read: number;
}

export function getTodayPages(
  sessions: ReadingSession[],
  opts?: DateOptions
): number {
  const today = getTodayDateString(opts);
  return sessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.pages_read, 0);
}

export function getMonthPages(
  sessions: ReadingSession[],
  opts?: DateOptions
): number {
  const yearMonth = getTodayDateString(opts).slice(0, 7); // YYYY-MM
  return sessions
    .filter((s) => s.date.startsWith(yearMonth))
    .reduce((acc, s) => acc + s.pages_read, 0);
}

export function getMonthPace(monthPages: number, opts?: DateOptions): number {
  const today = getTodayDateString(opts);
  const dayOfMonth = Number.parseInt(today.slice(8, 10), 10);
  if (!dayOfMonth) return 0;
  return Number((monthPages / dayOfMonth).toFixed(1));
}

export function getStreak(
  sessions: ReadingSession[],
  freezeDates: string[] = [],
  opts?: DateOptions
): number {
  if (sessions.length === 0 && freezeDates.length === 0) return 0;

  const dailyTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    dailyTotals[s.date] = (dailyTotals[s.date] || 0) + s.pages_read;
  });

  const freezeSet = new Set(freezeDates);
  const isCovered = (dateStr: string) =>
    (dailyTotals[dateStr] || 0) > 0 || freezeSet.has(dateStr);

  const todayStr = getTodayDateString(opts);
  // Construímos a Date a partir da string yyyy-MM-dd (meia-noite na TZ do
  // ambiente). Como só usamos `format(d, 'yyyy-MM-dd')` em seguida e o
  // ambiente é o mesmo, o resultado é consistente independente da TZ do
  // processo.
  let currentDate = parseISO(todayStr);

  if (!isCovered(todayStr)) {
    currentDate = subDays(currentDate, 1);
  }

  let streak = 0;
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    if (isCovered(dateStr)) {
      streak += 1;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getDailyGoalProgress(
  todayPages: number,
  goal: number | null
): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((todayPages / goal) * 100));
}

// Re-export para compatibilidade com callers antigos.
export { startOfMonth };
