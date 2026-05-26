import {
  differenceInCalendarDays,
  endOfYear,
  isWithinInterval,
  parseISO,
  startOfYear,
} from 'date-fns';
import type { Book, ReadingSession } from './index';

export interface YearTopBook {
  id: string;
  title: string;
  author: string | null;
  rating: number;
  coverUrl: string | null;
}

export interface YearStoryData {
  year: number;
  /** Total de páginas lidas em sessões do ano. */
  totalPages: number;
  /** Total de horas lidas (soma de duration_minutes / 60, arredondado). */
  totalHours: number;
  /** Quantas sessões foram registradas no ano. */
  totalSessions: number;
  /** Livros com status=finished que tiveram pelo menos uma sessão no ano. */
  booksFinished: number;
  /** Maior streak (dias consecutivos com leitura) dentro do ano. */
  longestStreak: number;
  /** Mês com mais páginas lidas. `null` se sem dados. */
  bestMonth: { name: string; pages: number } | null;
  /** Categoria mais lida no ano. `null` se sem dados ou sem categoria. */
  topCategory: { slug: string; label: string; pages: number } | null;
  /** Até 3 livros finalizados no ano com maior rating. */
  topBooks: YearTopBook[];
  /** Páginas/dia em média (apenas dias com leitura). */
  averagePagesPerActiveDay: number;
  /** Dias com pelo menos uma sessão no ano. */
  activeDays: number;
}

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const CATEGORY_LABELS: Record<string, string> = {
  ficcao: '📖 Ficção',
  'nao-ficcao': '📘 Não-ficção',
  tech: '💻 Tech',
  negocios: '💼 Negócios',
  autoajuda: '🌱 Autoajuda',
  biografia: '👤 Biografia',
  fantasia: '🐉 Fantasia',
  romance: '💕 Romance',
  suspense: '🔍 Suspense',
  academico: '🎓 Acadêmico',
};

function longestStreakInActiveDates(activeDates: Set<string>): number {
  if (activeDates.size === 0) return 0;

  const sorted = Array.from(activeDates).sort();
  let longest = 1;
  let current = 1;
  let prev = parseISO(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const date = parseISO(sorted[i]);
    if (differenceInCalendarDays(date, prev) === 1) {
      current += 1;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
    prev = date;
  }
  return longest;
}

/**
 * Gera os dados para a página "Year in Books" — uma retrospectiva anual.
 *
 * Filtra sessões e livros relevantes para o ano informado e calcula os
 * agregados de uma vez. Função pura, segura para usar em Server Components.
 */
export function generateYearStoryData(
  sessions: ReadingSession[],
  books: Book[],
  year: number
): YearStoryData {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));

  const yearSessions = sessions.filter((session) => {
    try {
      const date = parseISO(session.date);
      return isWithinInterval(date, { start: yearStart, end: yearEnd });
    } catch {
      return false;
    }
  });

  const totalPages = yearSessions.reduce((acc, s) => acc + s.pages_read, 0);
  const totalMinutes = yearSessions.reduce(
    (acc, s) => acc + (s.duration_minutes || 0),
    0
  );
  const totalHours = Math.round(totalMinutes / 60);

  const activeDates = new Set(yearSessions.map((s) => s.date));
  const activeDays = activeDates.size;
  const averagePagesPerActiveDay =
    activeDays > 0 ? Math.round(totalPages / activeDays) : 0;

  const longestStreak = longestStreakInActiveDates(activeDates);

  const monthPages = new Array(12).fill(0);
  yearSessions.forEach((session) => {
    try {
      const date = parseISO(session.date);
      monthPages[date.getMonth()] += session.pages_read;
    } catch {}
  });
  const maxMonthValue = Math.max(...monthPages);
  const bestMonth =
    maxMonthValue > 0
      ? {
          name: MONTH_NAMES[monthPages.indexOf(maxMonthValue)],
          pages: maxMonthValue,
        }
      : null;

  const bookById = new Map(books.map((b) => [b.id, b]));
  const categoryPages: Record<string, number> = {};
  yearSessions.forEach((session) => {
    const book = bookById.get(session.book_id);
    if (!book?.category) return;
    categoryPages[book.category] =
      (categoryPages[book.category] || 0) + session.pages_read;
  });
  const categoryEntries = Object.entries(categoryPages).sort(
    ([, a], [, b]) => b - a
  );
  const topCategory =
    categoryEntries.length > 0
      ? {
          slug: categoryEntries[0][0],
          label:
            CATEGORY_LABELS[categoryEntries[0][0]] ?? categoryEntries[0][0],
          pages: categoryEntries[0][1],
        }
      : null;

  const sessionBookIds = new Set(yearSessions.map((s) => s.book_id));
  const finishedInYear = books.filter(
    (b) => b.status === 'finished' && sessionBookIds.has(b.id)
  );

  const topBooks: YearTopBook[] = finishedInYear
    .filter((b) => b.rating !== null && b.rating > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3)
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      rating: b.rating ?? 0,
      coverUrl: b.cover_url,
    }));

  return {
    year,
    totalPages,
    totalHours,
    totalSessions: yearSessions.length,
    booksFinished: finishedInYear.length,
    longestStreak,
    bestMonth,
    topCategory,
    topBooks,
    averagePagesPerActiveDay,
    activeDays,
  };
}
