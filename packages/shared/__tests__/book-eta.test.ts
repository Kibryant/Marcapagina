import { describe, expect, it } from 'vitest';
import { calculateBookEta } from '../book-eta';

const REF = new Date('2026-05-20T12:00:00.000Z');

function session(date: string, pages: number) {
  return { date, pages_read: pages };
}

describe('calculateBookEta', () => {
  it('returns 0 days when the book is already finished', () => {
    const eta = calculateBookEta([], 200, 200, REF);
    expect(eta).toEqual({
      pagesRemaining: 0,
      pacePerDay: 0,
      daysRemaining: 0,
      windowDays: 30,
    });
  });

  it('returns null daysRemaining when there are no sessions', () => {
    const eta = calculateBookEta([], 50, 200, REF);
    expect(eta.pagesRemaining).toBe(150);
    expect(eta.daysRemaining).toBeNull();
    expect(eta.pacePerDay).toBe(0);
  });

  it('returns null when sessions exist but all are outside the window', () => {
    const sessions = [session('2026-04-01', 100)]; // > 30 days before REF
    const eta = calculateBookEta(sessions, 50, 200, REF);
    expect(eta.daysRemaining).toBeNull();
  });

  it('uses average over the 30-day window (not days with sessions)', () => {
    // 60 pages spread across 30 days = 2 pages/day average.
    // 150 pages remaining / 2 = 75 days.
    const sessions = [session('2026-05-20', 30), session('2026-05-15', 30)];
    const eta = calculateBookEta(sessions, 50, 200, REF);
    expect(eta.pacePerDay).toBe(2);
    expect(eta.daysRemaining).toBe(75);
  });

  it('rounds up the days remaining', () => {
    // 11 pages over 30 days ≈ 0.366/day. 10 pages remaining → ceil(10/0.366) = 28.
    const sessions = [session('2026-05-20', 11)];
    const eta = calculateBookEta(sessions, 190, 200, REF);
    expect(eta.daysRemaining).toBe(28);
  });

  it('handles a book with very recent intense reading', () => {
    // 300 pages in last 3 days, 30-day window = 10 pages/day.
    // 100 pages remaining → 10 days.
    const sessions = [
      session('2026-05-20', 100),
      session('2026-05-19', 100),
      session('2026-05-18', 100),
    ];
    const eta = calculateBookEta(sessions, 100, 200, REF);
    expect(eta.pacePerDay).toBe(10);
    expect(eta.daysRemaining).toBe(10);
  });

  it('ignores future-dated sessions (clock skew defensive)', () => {
    const sessions = [
      session('2026-05-25', 50), // future
      session('2026-05-20', 30),
    ];
    const eta = calculateBookEta(sessions, 100, 200, REF);
    expect(eta.pacePerDay).toBe(1); // 30/30, future ignored
  });
});
