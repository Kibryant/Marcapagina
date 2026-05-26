import { differenceInCalendarDays, parseISO } from 'date-fns';

interface EtaSession {
  date: string;
  pages_read: number;
}

export interface BookEta {
  /** Páginas que faltam para terminar. */
  pagesRemaining: number;
  /** Média de páginas/dia usada no cálculo (0 se sem dados). */
  pacePerDay: number;
  /** Dias até terminar no ritmo atual. `null` se não há dados suficientes. */
  daysRemaining: number | null;
  /** Quantos dias de histórico foram considerados (até 30). */
  windowDays: number;
}

/**
 * Estima quantos dias faltam para terminar o livro com base no ritmo recente.
 *
 * Considera as sessões dos últimos 30 dias (calendário, não corridos), divide
 * o total de páginas lidas pelo número de dias da janela e projeta o tempo
 * restante. Janela curta de propósito: o leitor de hoje importa mais do que
 * o de 3 meses atrás.
 *
 * Retorna `daysRemaining: null` quando o livro já terminou ou quando não há
 * nenhuma sessão na janela — caller decide o copy a exibir.
 */
export function calculateBookEta(
  sessions: EtaSession[],
  currentPage: number,
  totalPages: number,
  referenceDate: Date = new Date()
): BookEta {
  const windowDays = 30;
  const pagesRemaining = Math.max(0, totalPages - currentPage);

  if (pagesRemaining === 0) {
    return { pagesRemaining: 0, pacePerDay: 0, daysRemaining: 0, windowDays };
  }

  const recentSessions = sessions.filter((session) => {
    try {
      const sessionDate = parseISO(session.date);
      const diff = differenceInCalendarDays(referenceDate, sessionDate);
      return diff >= 0 && diff < windowDays;
    } catch {
      return false;
    }
  });

  if (recentSessions.length === 0) {
    return { pagesRemaining, pacePerDay: 0, daysRemaining: null, windowDays };
  }

  const totalPagesRead = recentSessions.reduce(
    (sum, s) => sum + s.pages_read,
    0
  );
  const pacePerDay = totalPagesRead / windowDays;

  if (pacePerDay <= 0) {
    return { pagesRemaining, pacePerDay: 0, daysRemaining: null, windowDays };
  }

  return {
    pagesRemaining,
    pacePerDay: Number(pacePerDay.toFixed(2)),
    daysRemaining: Math.ceil(pagesRemaining / pacePerDay),
    windowDays,
  };
}
