import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { startOfMonth, subDays, differenceInDays, format, getDay, parseISO, isSameMonth, subMonths, endOfMonth } from "date-fns";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ReadingSession {
  id?: string;
  user_id?: string;
  book_id?: string;
  date: string; // YYYY-MM-DD
  pages_read: number;
  created_at?: string; // ISO string
}

export interface Book {
  id: string;
  status: string; // "reading", "completed", "want_to_read"
}

// === GOALS LOGIC ===

export function calculateGoalsSuggestions(sessions: ReadingSession[], currentMonthPages: number) {
  const today = new Date();

  // Calculate stats for the last 14 days
  let totalPages14Days = 0;
  let consistentDays14Days = 0;

  for (let i = 0; i < 14; i++) {
    const targetDate = subDays(today, i);
    const dateStr = format(targetDate, "yyyy-MM-dd");

    // Sum pages read on this day
    const pagesOnDay = sessions
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + s.pages_read, 0);

    totalPages14Days += pagesOnDay;
    if (pagesOnDay > 0) {
      consistentDays14Days++;
    }
  }

  const average14Days = totalPages14Days / 14;

  let suggestedDaily = 0;
  let reason = "";

  if (consistentDays14Days >= 8) {
    suggestedDaily = Math.ceil(average14Days * 1.15);
    reason = "Ritmo forte! Aumentamos 15% para te desafiar.";
  } else if (consistentDays14Days >= 4) {
    suggestedDaily = Math.ceil(average14Days * 1.05);
    reason = "Boa consistência. Um leve aumento de 5% para crescer.";
  } else {
    suggestedDaily = Math.max(3, Math.ceil(average14Days));
    reason = "Vamos retomar o hábito com uma meta mais realista.";
  }

  // Monthly suggestion
  const daysInMonth = differenceInDays(endOfMonth(today), startOfMonth(today)) + 1;
  const daysPassed = today.getDate();
  const daysRemaining = daysInMonth - daysPassed + 1; // including today

  let suggestedMonthly = currentMonthPages + (suggestedDaily * daysRemaining);

  // Fallback clamping: assume an upper limit to avoid crazy numbers
  const maxProjected = Math.max(30, average14Days * 30 * 1.5);
  if (suggestedMonthly > maxProjected && currentMonthPages < maxProjected) {
    suggestedMonthly = Math.ceil(maxProjected);
  }

  return {
    suggestedDaily,
    suggestedMonthly,
    reason,
    consistency: consistentDays14Days,
    average: Number(average14Days.toFixed(1))
  };
}


// === STORY / NARRATIVE LOGIC ===

export function generateStoryData(sessions: ReadingSession[], books: Book[]) {
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));

  // 1. Pages this month vs last month
  const currentMonthSessions = sessions.filter(s => {
    try {
      const d = parseISO(s.date);
      return isSameMonth(d, currentMonthStart);
    } catch { return false; }
  });

  const currentMonthPages = currentMonthSessions.reduce((sum, s) => sum + s.pages_read, 0);

  const lastMonthSessions = sessions.filter(s => {
    try {
      const d = parseISO(s.date);
      return isSameMonth(d, lastMonthStart);
    } catch { return false; }
  });

  const lastMonthPages = lastMonthSessions.reduce((sum, s) => sum + s.pages_read, 0);

  let monthComparisonPercent = 0;
  if (lastMonthPages > 0) {
    monthComparisonPercent = Math.round(((currentMonthPages - lastMonthPages) / lastMonthPages) * 100);
  }

  // 2. Best day of week (0 = Sunday, 1 = Monday ...)
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach(s => {
    try {
      const d = parseISO(s.date);
      dayOfWeekCounts[getDay(d)] += s.pages_read;
    } catch { }
  });

  const maxDayValue = Math.max(...dayOfWeekCounts);
  const bestDayIndex = maxDayValue > 0 ? dayOfWeekCounts.indexOf(maxDayValue) : -1;
  const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const bestDayName = bestDayIndex >= 0 ? dayNames[bestDayIndex] : "nenhum";

  // 3. Strongest Hour (00-05, 06-11, 12-17, 18-23)
  let madrugada = 0; // 0-5
  let manha = 0;     // 6-11
  let tarde = 0;     // 12-17
  let noite = 0;     // 18-23

  sessions.forEach(s => {
    if (s.created_at) {
      const dbDate = new Date(s.created_at);
      const h = dbDate.getHours(); // Local timezone used
      if (h >= 0 && h <= 5) madrugada += s.pages_read;
      else if (h >= 6 && h <= 11) manha += s.pages_read;
      else if (h >= 12 && h <= 17) tarde += s.pages_read;
      else noite += s.pages_read;
    }
  });

  const timePeriods = [
    { name: "madrugada", val: madrugada },
    { name: "manhã", val: manha },
    { name: "tarde", val: tarde },
    { name: "noite", val: noite },
  ];

  timePeriods.sort((a, b) => b.val - a.val);
  const bestTimeName = timePeriods[0].val > 0 ? timePeriods[0].name : "indefinido";

  // 4. Consistency in current month
  const daysPassedInMonth = today.getDate();
  const uniqueDaysReadThisMonth = new Set(currentMonthSessions.map(s => s.date)).size;

  // 5. Finished books
  const finishedBooksCount = books.filter(b => b.status === "completed").length;

  return {
    currentMonthPages,
    lastMonthPages,
    monthComparisonPercent,
    bestDayName,
    bestTimeName,
    uniqueDaysReadThisMonth,
    daysPassedInMonth,
    finishedBooksCount
  };
}
