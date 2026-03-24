import { describe, expect, it, vi } from 'vitest';

// Mock Supabase client — not needed for pure function tests
vi.mock('../lib/supabase/client', () => ({ createClient: vi.fn() }));

import {
  XP_PER_MINUTE,
  XP_PER_PAGE,
  XP_TO_NEXT_LEVEL,
  calculateLevel,
  getXPProgress,
} from '../lib/xp';

// ─── XP formula constants ─────────────────────────────────────────────────────

describe('XP formula constants', () => {
  it('awards 10 XP per page', () => {
    expect(XP_PER_PAGE).toBe(10);
  });

  it('awards 5 XP per minute', () => {
    expect(XP_PER_MINUTE).toBe(5);
  });

  it('requires 1000 XP to reach the next level', () => {
    expect(XP_TO_NEXT_LEVEL).toBe(1000);
  });

  it('applies the formula correctly: pages × 10 + minutes × 5', () => {
    const pages = 20;
    const minutes = 30;
    expect(pages * XP_PER_PAGE + minutes * XP_PER_MINUTE).toBe(350);
  });
});

// ─── calculateLevel ───────────────────────────────────────────────────────────

describe('calculateLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('stays at level 1 just before the threshold', () => {
    expect(calculateLevel(999)).toBe(1);
  });

  it('reaches level 2 at exactly 1000 XP', () => {
    expect(calculateLevel(1000)).toBe(2);
  });

  it('reaches level 3 at exactly 2000 XP', () => {
    expect(calculateLevel(2000)).toBe(3);
  });

  it('stays at the same level within a tier', () => {
    expect(calculateLevel(1500)).toBe(2);
  });

  it('handles large XP values correctly', () => {
    expect(calculateLevel(10000)).toBe(11);
  });
});

// ─── getXPProgress ────────────────────────────────────────────────────────────

describe('getXPProgress', () => {
  it('returns 0% at 0 XP', () => {
    expect(getXPProgress(0)).toBe(0);
  });

  it('returns 50% at the halfway point of a level', () => {
    expect(getXPProgress(500)).toBe(50);
  });

  it('returns 0% at a level boundary (all XP consumed by the new level)', () => {
    expect(getXPProgress(1000)).toBe(0);
  });

  it('returns the correct progress within the second level', () => {
    // 1000 to reach level 2, then 250 more → 25%
    expect(getXPProgress(1250)).toBe(25);
  });

  it('returns 100% just before reaching the next level', () => {
    // 999 XP → 99.9% → rounds to 100
    expect(getXPProgress(999)).toBe(100);
  });
});
