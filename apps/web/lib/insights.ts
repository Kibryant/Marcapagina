import { parseISO, getHours } from "date-fns";

export interface ReadingSession {
  created_at: string;
  pages_read: number;
}

export interface Insight {
  type: "time" | "consistency" | "trend";
  title: string;
  description: string;
  icon: string;
}

/**
 * 1.1 Padrão de horário
 */
export function getTimeInsight(sessions: ReadingSession[]): Insight | null {
  if (sessions.length < 3) return null;

  const counts = {
    madrugada: 0,
    manha: 0,
    tarde: 0,
    noite: 0,
  };

  sessions.forEach((s) => {
    const hour = getHours(parseISO(s.created_at));
    if (hour >= 0 && hour < 6) counts.madrugada++;
    else if (hour >= 6 && hour < 12) counts.manha++;
    else if (hour >= 12 && hour < 18) counts.tarde++;
    else counts.noite++;
  });

  const max = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a));

  if (max[1] === 0) return null;

  const labels: Record<string, string> = {
    madrugada: "na madrugada",
    manha: "pela manhã",
    tarde: "durante a tarde",
    noite: "à noite",
  };

  return {
    type: "time",
    title: `Leitor ${labels[max[0]]}`,
    description: `Seu horário mais produtivo é ${labels[max[0]]}. Tente proteger esse tempo!`,
    icon: max[0] === "noite" || max[0] === "madrugada" ? "Moon" : "Sun",
  };
}

/**
 * 1.2 Consistência semanal
 */
export function getConsistencyInsight(sessions: ReadingSession[]): Insight | null {
  if (sessions.length < 10) return null;

  const dayCounts: Record<number, number> = {};
  sessions.forEach((s) => {
    const day = parseISO(s.created_at).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const days = Object.entries(dayCounts);
  if (days.length === 1) return null;

  const sorted = days.sort((a, b) => b[1] - a[1]);
  const bestDay = parseInt(sorted[0][0]);

  const dayNames = [
    "Domingos", "Segundas", "Terças", "Quartas", "Quintas", "Sextas", "Sábados"
  ];

  const isWeekend = bestDay === 0 || bestDay === 6;

  return {
    type: "consistency",
    title: isWeekend ? "Foco no final de semana" : "Foco nos dias úteis",
    description: `${dayNames[bestDay]} costumam ser seus dias mais consistentes de leitura.`,
    icon: "Calendar",
  };
}

/**
 * 1.3 Ritmo e tendência
 */
export function getTrendInsight(sessions: ReadingSession[]): Insight | null {
  if (sessions.length < 5) return null;

  // Last 7 days vs Previous 7 days
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const thisWeekSessions = sessions.filter(s => {
    const date = parseISO(s.created_at);
    return now.getTime() - date.getTime() <= weekMs;
  });

  const lastWeekSessions = sessions.filter(s => {
    const date = parseISO(s.created_at);
    const diff = now.getTime() - date.getTime();
    return diff > weekMs && diff <= weekMs * 2;
  });

  const thisWeekTotal = thisWeekSessions.reduce((acc, s) => acc + s.pages_read, 0);
  const lastWeekTotal = lastWeekSessions.reduce((acc, s) => acc + s.pages_read, 0);

  if (thisWeekTotal > lastWeekTotal && lastWeekTotal > 0) {
    const increase = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
    return {
      type: "trend",
      title: "Ritmo em alta",
      description: `Você leu ${increase}% mais páginas esta semana em comparação com a anterior.`,
      icon: "TrendingUp",
    };
  }

  return null;
}

export function getAllInsights(sessions: ReadingSession[]): Insight[] {
  const insights: Insight[] = [];

  const time = getTimeInsight(sessions);
  if (time) insights.push(time);

  const consistency = getConsistencyInsight(sessions);
  if (consistency) insights.push(consistency);

  const trend = getTrendInsight(sessions);
  if (trend) insights.push(trend);

  return insights;
}
