import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, getClientIp } from '../lib/rate-limit';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('allows the first request and returns remaining = limit - 1', () => {
    const r = checkRateLimit({ key: 'k1', limit: 3, windowMs: 1000 });
    expect(r.success).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it('counts down across requests in the same window', () => {
    const a = checkRateLimit({ key: 'k2', limit: 3, windowMs: 1000 });
    const b = checkRateLimit({ key: 'k2', limit: 3, windowMs: 1000 });
    const c = checkRateLimit({ key: 'k2', limit: 3, windowMs: 1000 });
    expect(a.remaining).toBe(2);
    expect(b.remaining).toBe(1);
    expect(c.remaining).toBe(0);
    expect([a, b, c].every((r) => r.success)).toBe(true);
  });

  it('blocks the n+1 request with success=false', () => {
    checkRateLimit({ key: 'k3', limit: 2, windowMs: 1000 });
    checkRateLimit({ key: 'k3', limit: 2, windowMs: 1000 });
    const r = checkRateLimit({ key: 'k3', limit: 2, windowMs: 1000 });
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    checkRateLimit({ key: 'k4', limit: 1, windowMs: 1000 });
    const blocked = checkRateLimit({ key: 'k4', limit: 1, windowMs: 1000 });
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(1001);
    const ok = checkRateLimit({ key: 'k4', limit: 1, windowMs: 1000 });
    expect(ok.success).toBe(true);
    expect(ok.remaining).toBe(0);
  });

  it('isolates buckets by key', () => {
    checkRateLimit({ key: 'a', limit: 1, windowMs: 1000 });
    const otherKey = checkRateLimit({ key: 'b', limit: 1, windowMs: 1000 });
    expect(otherKey.success).toBe(true);
  });
});

describe('getClientIp', () => {
  it('uses the first IP from x-forwarded-for', () => {
    const req = new Request('http://x.test', {
      headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://x.test', {
      headers: { 'x-real-ip': '5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('5.6.7.8');
  });

  it('returns "unknown" when no headers present', () => {
    const req = new Request('http://x.test');
    expect(getClientIp(req)).toBe('unknown');
  });
});
