import { describe, expect, it } from 'vitest';
import type { Book, ReadingSession } from '../index';
import { generateYearStoryData } from '../year-story';

function session(
  partial: Partial<ReadingSession> & {
    date: string;
    pages_read: number;
    book_id?: string;
  }
): ReadingSession {
  return {
    id: 'sess',
    user_id: 'u',
    book_id: partial.book_id ?? 'b1',
    date: partial.date,
    pages_read: partial.pages_read,
    duration_minutes: partial.duration_minutes ?? 0,
    created_at: partial.created_at ?? `${partial.date}T10:00:00Z`,
  };
}

function book(partial: Partial<Book> & { id: string }): Book {
  return {
    id: partial.id,
    user_id: 'u',
    title: partial.title ?? 'Title',
    author: partial.author ?? null,
    total_pages: partial.total_pages ?? 200,
    current_page: partial.current_page ?? 0,
    status: partial.status ?? 'reading',
    category: partial.category ?? null,
    rating: partial.rating ?? null,
    summary: null,
    cover_url: partial.cover_url ?? null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };
}

describe('generateYearStoryData', () => {
  it('returns zeros when there is nothing to aggregate', () => {
    const result = generateYearStoryData([], [], 2026);
    expect(result.totalPages).toBe(0);
    expect(result.booksFinished).toBe(0);
    expect(result.bestMonth).toBeNull();
    expect(result.topCategory).toBeNull();
    expect(result.topBooks).toEqual([]);
    expect(result.longestStreak).toBe(0);
  });

  it('only counts sessions within the requested year', () => {
    const sessions = [
      session({ date: '2026-03-10', pages_read: 50 }),
      session({ date: '2025-12-31', pages_read: 100 }), // previous year
      session({ date: '2027-01-01', pages_read: 100 }), // next year
    ];
    const result = generateYearStoryData(sessions, [], 2026);
    expect(result.totalPages).toBe(50);
    expect(result.totalSessions).toBe(1);
  });

  it('converts minutes to hours rounded', () => {
    const sessions = [
      session({ date: '2026-04-01', pages_read: 1, duration_minutes: 30 }),
      session({ date: '2026-04-02', pages_read: 1, duration_minutes: 45 }),
    ];
    const result = generateYearStoryData(sessions, [], 2026);
    // 75 min → 1.25h → rounded to 1
    expect(result.totalHours).toBe(1);
  });

  it('finds the best month by total pages', () => {
    const sessions = [
      session({ date: '2026-01-01', pages_read: 30 }),
      session({ date: '2026-01-15', pages_read: 30 }),
      session({ date: '2026-03-10', pages_read: 100 }),
      session({ date: '2026-05-20', pages_read: 50 }),
    ];
    const result = generateYearStoryData(sessions, [], 2026);
    expect(result.bestMonth).toEqual({ name: 'março', pages: 100 });
  });

  it('finds the top category by pages summed from book lookup', () => {
    const books = [
      book({ id: 'b1', category: 'tech' }),
      book({ id: 'b2', category: 'ficcao' }),
    ];
    const sessions = [
      session({ date: '2026-01-01', pages_read: 100, book_id: 'b1' }),
      session({ date: '2026-02-01', pages_read: 200, book_id: 'b2' }),
      session({ date: '2026-03-01', pages_read: 30, book_id: 'b2' }),
    ];
    const result = generateYearStoryData(sessions, books, 2026);
    expect(result.topCategory?.slug).toBe('ficcao');
    expect(result.topCategory?.pages).toBe(230);
  });

  it('counts only finished books that had at least one session in the year', () => {
    const books = [
      book({ id: 'b1', status: 'finished' }), // finished, no session in 2026
      book({ id: 'b2', status: 'finished' }), // finished, with session
      book({ id: 'b3', status: 'reading' }), // not finished
    ];
    const sessions = [
      session({ date: '2026-04-01', pages_read: 100, book_id: 'b2' }),
      session({ date: '2026-05-01', pages_read: 30, book_id: 'b3' }),
    ];
    const result = generateYearStoryData(sessions, books, 2026);
    expect(result.booksFinished).toBe(1);
  });

  it('returns up to 3 top books by rating among finished-this-year', () => {
    const books = [
      book({ id: 'b1', status: 'finished', rating: 5, title: 'A' }),
      book({ id: 'b2', status: 'finished', rating: 4, title: 'B' }),
      book({ id: 'b3', status: 'finished', rating: 3, title: 'C' }),
      book({ id: 'b4', status: 'finished', rating: 5, title: 'D' }),
      book({ id: 'b5', status: 'finished', rating: null, title: 'E' }), // no rating
    ];
    const sessions = [
      session({ date: '2026-01-01', pages_read: 1, book_id: 'b1' }),
      session({ date: '2026-01-01', pages_read: 1, book_id: 'b2' }),
      session({ date: '2026-01-01', pages_read: 1, book_id: 'b3' }),
      session({ date: '2026-01-01', pages_read: 1, book_id: 'b4' }),
      session({ date: '2026-01-01', pages_read: 1, book_id: 'b5' }),
    ];
    const result = generateYearStoryData(sessions, books, 2026);
    expect(result.topBooks).toHaveLength(3);
    expect(result.topBooks.map((b) => b.rating)).toEqual([5, 5, 4]);
  });

  it('calculates the longest in-year streak as date islands', () => {
    const sessions = [
      session({ date: '2026-03-01', pages_read: 1 }),
      session({ date: '2026-03-02', pages_read: 1 }),
      session({ date: '2026-03-03', pages_read: 1 }), // 3-day streak
      // gap
      session({ date: '2026-05-10', pages_read: 1 }),
      session({ date: '2026-05-11', pages_read: 1 }), // 2-day streak
    ];
    const result = generateYearStoryData(sessions, [], 2026);
    expect(result.longestStreak).toBe(3);
    expect(result.activeDays).toBe(5);
  });

  it('averages pages per active day, ignoring blank days', () => {
    const sessions = [
      session({ date: '2026-01-01', pages_read: 100 }),
      session({ date: '2026-01-15', pages_read: 50 }),
    ];
    const result = generateYearStoryData(sessions, [], 2026);
    expect(result.activeDays).toBe(2);
    expect(result.averagePagesPerActiveDay).toBe(75);
  });
});
