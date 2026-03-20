import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { calculateGoalsSuggestions } from '../index';
import type { ReadingSession } from '../metrics';

// Freeze time at 2026-03-20 (day 20 of March)
const FAKE_NOW = new Date('2026-03-20T12:00:00.000Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FAKE_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

function session(
  daysAgo: number,
  pages: number,
  referenceDate = FAKE_NOW
): ReadingSession {
  const d = new Date(referenceDate);
  d.setDate(d.getDate() - daysAgo);
  const date = d.toISOString().split('T')[0];
  return {
    id: `session-${daysAgo}-${pages}`,
    user_id: 'user-1',
    book_id: 'book-1',
    date,
    pages_read: pages,
    duration_minutes: 0,
    created_at: new Date().toISOString(),
  };
}

describe('calculateGoalsSuggestions', () => {
  it('suggests a minimum of 3 pages/day when there is no reading history', () => {
    const result = calculateGoalsSuggestions([], 0);
    expect(result.suggestedDaily).toBeGreaterThanOrEqual(3);
    expect(result.consistency).toBe(0);
    expect(result.average).toBe(0);
  });

  it('increases the suggestion by 15% when consistency is high (8+ days in 14)', () => {
    // 10 consecutive days of 20 pages
    const sessions: ReadingSession[] = Array.from({ length: 10 }, (_, i) =>
      session(i, 20)
    );
    const result = calculateGoalsSuggestions(sessions, 200);

    // average ≈ 20 * 10 / 14 ≈ 14.3, +15% ≈ ceil(16.4) = 17
    expect(result.consistency).toBeGreaterThanOrEqual(8);
    expect(result.suggestedDaily).toBe(Math.ceil(result.average * 1.15));
    expect(result.reason).toContain('15%');
  });

  it('increases the suggestion by 5% when consistency is moderate (4–7 days in 14)', () => {
    // 5 days of reading in the last 14
    const sessions: ReadingSession[] = Array.from({ length: 5 }, (_, i) =>
      session(i * 2, 20) // every other day
    );
    const result = calculateGoalsSuggestions(sessions, 100);

    expect(result.consistency).toBeGreaterThanOrEqual(4);
    expect(result.consistency).toBeLessThan(8);
    expect(result.suggestedDaily).toBe(Math.ceil(result.average * 1.05));
    expect(result.reason).toContain('5%');
  });

  it('suggests a realistic goal when consistency is low (< 4 days in 14)', () => {
    // Only 2 days of reading
    const sessions: ReadingSession[] = [session(1, 10), session(3, 10)];
    const result = calculateGoalsSuggestions(sessions, 20);

    expect(result.consistency).toBeLessThan(4);
    expect(result.suggestedDaily).toBeGreaterThanOrEqual(3);
    expect(result.reason).toContain('realista');
  });

  it('always produces a positive suggestedMonthly', () => {
    const sessions: ReadingSession[] = [session(0, 5)];
    const result = calculateGoalsSuggestions(sessions, 5);
    expect(result.suggestedMonthly).toBeGreaterThan(0);
  });

  it('exposes the 14-day average correctly', () => {
    // 14 days of exactly 10 pages each
    const sessions: ReadingSession[] = Array.from({ length: 14 }, (_, i) =>
      session(i, 10)
    );
    const result = calculateGoalsSuggestions(sessions, 140);
    expect(result.average).toBe(10);
  });
});
