import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { generateStoryData } from '../index';
import type { Book, ReadingSession } from '../index';

// Freeze time at 2026-03-20 (Friday, day 20 of March)
const FAKE_NOW = new Date('2026-03-20T12:00:00.000Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FAKE_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

let _id = 0;

function session(date: string, pages: number, created_at?: string): ReadingSession {
  return {
    id: `session-${++_id}`,
    user_id: 'user-1',
    book_id: 'book-1',
    date,
    pages_read: pages,
    duration_minutes: 10,
    created_at: created_at ?? `${date}T12:00:00.000Z`,
  };
}

function book(status: Book['status']): Book {
  return {
    id: `book-${++_id}`,
    user_id: 'user-1',
    title: 'Test Book',
    author: null,
    total_pages: 200,
    current_page: 0,
    status,
    category: null,
    rating: null,
    summary: null,
    cover_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

// ─── Monthly pages ────────────────────────────────────────────────────────────

describe('generateStoryData — monthly pages', () => {
  it('returns 0 for all values when there are no sessions or books', () => {
    const result = generateStoryData([], []);
    expect(result.currentMonthPages).toBe(0);
    expect(result.lastMonthPages).toBe(0);
    expect(result.monthComparisonPercent).toBe(0);
  });

  it('sums only current month pages in currentMonthPages', () => {
    const sessions = [
      session('2026-03-10', 50),
      session('2026-03-20', 30),
      session('2026-02-15', 100), // last month
    ];
    const result = generateStoryData(sessions, []);
    expect(result.currentMonthPages).toBe(80);
  });

  it('sums only last month pages in lastMonthPages', () => {
    const sessions = [
      session('2026-03-10', 50),
      session('2026-02-01', 60),
      session('2026-02-28', 40),
    ];
    const result = generateStoryData(sessions, []);
    expect(result.lastMonthPages).toBe(100);
  });

  it('calculates positive monthComparisonPercent when reading increased', () => {
    // 150 this month vs 100 last month → +50%
    const sessions = [
      session('2026-03-10', 150),
      session('2026-02-10', 100),
    ];
    const result = generateStoryData(sessions, []);
    expect(result.monthComparisonPercent).toBe(50);
  });

  it('calculates negative monthComparisonPercent when reading decreased', () => {
    // 50 this month vs 100 last month → -50%
    const sessions = [
      session('2026-03-10', 50),
      session('2026-02-10', 100),
    ];
    const result = generateStoryData(sessions, []);
    expect(result.monthComparisonPercent).toBe(-50);
  });

  it('returns 0 for monthComparisonPercent when last month had no reading', () => {
    const sessions = [session('2026-03-10', 50)];
    const result = generateStoryData(sessions, []);
    expect(result.monthComparisonPercent).toBe(0);
  });
});

// ─── Best day of week ─────────────────────────────────────────────────────────

describe('generateStoryData — best day of week', () => {
  it('returns "nenhum" when there are no sessions', () => {
    const result = generateStoryData([], []);
    expect(result.bestDayName).toBe('nenhum');
  });

  it('identifies the day with the most total pages read', () => {
    // 2026-03-20 is a Friday (sexta-feira), 2026-03-19 is Thursday (quinta-feira)
    const sessions = [
      session('2026-03-20', 100), // Friday
      session('2026-03-19', 20),  // Thursday
      session('2026-03-18', 20),  // Wednesday
    ];
    const result = generateStoryData(sessions, []);
    expect(result.bestDayName).toBe('sexta-feira');
  });

  it('accumulates pages across multiple sessions on the same day of week', () => {
    // Both sessions on Thursday total 80 pages vs Friday's 50
    const sessions = [
      session('2026-03-20', 50), // Friday
      session('2026-03-19', 40), // Thursday
      session('2026-03-12', 40), // also Thursday (previous week)
    ];
    const result = generateStoryData(sessions, []);
    expect(result.bestDayName).toBe('quinta-feira');
  });
});

// ─── Consistency ─────────────────────────────────────────────────────────────

describe('generateStoryData — consistency', () => {
  it('counts unique reading days in the current month only', () => {
    const sessions = [
      session('2026-03-10', 10),
      session('2026-03-10', 20), // same day — counts as 1
      session('2026-03-15', 30),
      session('2026-02-20', 10), // last month — excluded
    ];
    const result = generateStoryData(sessions, []);
    expect(result.uniqueDaysReadThisMonth).toBe(2);
  });

  it('returns 0 unique days when no current-month sessions exist', () => {
    const sessions = [session('2026-02-10', 50)];
    const result = generateStoryData(sessions, []);
    expect(result.uniqueDaysReadThisMonth).toBe(0);
  });

  it('reports daysPassedInMonth as the current day of the month', () => {
    const result = generateStoryData([], []);
    expect(result.daysPassedInMonth).toBe(20); // March 20
  });
});

// ─── Finished books ───────────────────────────────────────────────────────────

describe('generateStoryData — finished books', () => {
  it('returns 0 when no books are finished', () => {
    const books = [book('reading'), book('wishlist'), book('next')];
    const result = generateStoryData([], books);
    expect(result.finishedBooksCount).toBe(0);
  });

  it('counts only books with status "finished"', () => {
    const books = [book('finished'), book('finished'), book('reading'), book('wishlist')];
    const result = generateStoryData([], books);
    expect(result.finishedBooksCount).toBe(2);
  });

  it('returns 0 with an empty book list', () => {
    const result = generateStoryData([], []);
    expect(result.finishedBooksCount).toBe(0);
  });
});
