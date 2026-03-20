import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  getDailyGoalProgress,
  getMonthPace,
  getMonthPages,
  getStreak,
  getTodayPages,
} from '../metrics';

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

function session(date: string, pages: number) {
  return { date, pages_read: pages };
}

// ─── getTodayPages ───────────────────────────────────────────────────────────

describe('getTodayPages', () => {
  it('returns 0 when there are no sessions', () => {
    expect(getTodayPages([])).toBe(0);
  });

  it('sums only sessions from today', () => {
    const sessions = [
      session('2026-03-20', 10),
      session('2026-03-20', 5),
      session('2026-03-19', 20), // yesterday — should be excluded
    ];
    expect(getTodayPages(sessions)).toBe(15);
  });

  it('returns 0 when today has no sessions', () => {
    const sessions = [session('2026-03-19', 30), session('2026-03-18', 10)];
    expect(getTodayPages(sessions)).toBe(0);
  });
});

// ─── getMonthPages ───────────────────────────────────────────────────────────

describe('getMonthPages', () => {
  it('returns 0 for an empty list', () => {
    expect(getMonthPages([])).toBe(0);
  });

  it('sums all sessions in the current month', () => {
    const sessions = [
      session('2026-03-01', 50),
      session('2026-03-15', 30),
      session('2026-03-20', 20),
    ];
    expect(getMonthPages(sessions)).toBe(100);
  });

  it('excludes sessions from previous months', () => {
    const sessions = [
      session('2026-03-10', 40),
      session('2026-02-28', 100), // last month
      session('2025-12-31', 200), // last year
    ];
    expect(getMonthPages(sessions)).toBe(40);
  });

  it('includes sessions from the first day of the month', () => {
    const sessions = [session('2026-03-01', 25)];
    expect(getMonthPages(sessions)).toBe(25);
  });
});

// ─── getMonthPace ────────────────────────────────────────────────────────────

describe('getMonthPace', () => {
  it('divides pages by the current day of the month', () => {
    // Today is day 20
    expect(getMonthPace(100)).toBe(5);
  });

  it('rounds to 1 decimal place', () => {
    expect(getMonthPace(50)).toBe(2.5);
  });

  it('returns 0 when no pages were read', () => {
    expect(getMonthPace(0)).toBe(0);
  });
});

// ─── getStreak ───────────────────────────────────────────────────────────────

describe('getStreak', () => {
  it('returns 0 for an empty list', () => {
    expect(getStreak([])).toBe(0);
  });

  it('returns 1 when only today has a session', () => {
    expect(getStreak([session('2026-03-20', 10)])).toBe(1);
  });

  it('counts consecutive days including today', () => {
    const sessions = [
      session('2026-03-20', 10),
      session('2026-03-19', 20),
      session('2026-03-18', 15),
    ];
    expect(getStreak(sessions)).toBe(3);
  });

  it('starts from yesterday when today has no reading', () => {
    const sessions = [
      session('2026-03-19', 10),
      session('2026-03-18', 10),
    ];
    expect(getStreak(sessions)).toBe(2);
  });

  it('breaks the streak at a gap', () => {
    const sessions = [
      session('2026-03-20', 10),
      session('2026-03-19', 10),
      // gap: 18 is missing
      session('2026-03-17', 10),
    ];
    expect(getStreak(sessions)).toBe(2);
  });

  it('returns 0 when the last session is more than 1 day old', () => {
    const sessions = [session('2026-03-18', 10)];
    expect(getStreak(sessions)).toBe(0);
  });

  it('aggregates multiple sessions on the same day as a single day', () => {
    const sessions = [
      session('2026-03-20', 5),
      session('2026-03-20', 10), // same day, two sessions
      session('2026-03-19', 20),
    ];
    expect(getStreak(sessions)).toBe(2);
  });
});

// ─── getDailyGoalProgress ────────────────────────────────────────────────────

describe('getDailyGoalProgress', () => {
  it('returns 0 when goal is null', () => {
    expect(getDailyGoalProgress(10, null)).toBe(0);
  });

  it('returns 0 when goal is 0', () => {
    expect(getDailyGoalProgress(10, 0)).toBe(0);
  });

  it('returns the correct percentage', () => {
    expect(getDailyGoalProgress(10, 20)).toBe(50);
  });

  it('caps at 100 when pages exceed the goal', () => {
    expect(getDailyGoalProgress(30, 20)).toBe(100);
  });

  it('returns 100 when exactly at goal', () => {
    expect(getDailyGoalProgress(20, 20)).toBe(100);
  });

  it('returns 0 when no pages read', () => {
    expect(getDailyGoalProgress(0, 20)).toBe(0);
  });
});
