import { describe, expect, it } from 'vitest';
import {
  createSession,
  deleteSession,
  deleteSessionsByBook,
  listSessions,
  listSessionsByBook,
  logReadingSession,
  updateSession,
} from '../src/sessions';
import { createMockSupabase } from './mock';

describe('sessions repo', () => {
  it('listSessions reads the user sessions by date desc', async () => {
    const { supabase, calls } = createMockSupabase({ data: [{ id: 's1' }] });
    expect(await listSessions(supabase, 'u1')).toEqual([{ id: 's1' }]);
    expect(calls).toContainEqual({
      method: 'from',
      args: ['reading_sessions'],
    });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
    expect(calls).toContainEqual({
      method: 'order',
      args: ['date', { ascending: false }],
    });
  });

  it('listSessionsByBook filters by book_id', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listSessionsByBook(supabase, 'b1');
    expect(calls).toContainEqual({ method: 'eq', args: ['book_id', 'b1'] });
  });

  it('createSession inserts into reading_sessions', async () => {
    const { supabase, calls } = createMockSupabase();
    await createSession(supabase, {
      user_id: 'u1',
      book_id: 'b1',
      pages_read: 10,
      date: '2026-05-20',
    });
    expect(calls).toContainEqual({
      method: 'from',
      args: ['reading_sessions'],
    });
    expect(calls.some((c) => c.method === 'insert')).toBe(true);
  });

  it('updateSession updates by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await updateSession(supabase, 's1', { pages_read: 5 });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 's1'] });
  });

  it('deleteSession deletes by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await deleteSession(supabase, 's1');
    expect(calls.some((c) => c.method === 'delete')).toBe(true);
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 's1'] });
  });

  it('deleteSessionsByBook deletes by book_id', async () => {
    const { supabase, calls } = createMockSupabase();
    await deleteSessionsByBook(supabase, 'b1');
    expect(calls).toContainEqual({ method: 'eq', args: ['book_id', 'b1'] });
  });

  it('logReadingSession calls the RPC with mapped params', async () => {
    const { supabase, calls } = createMockSupabase({
      data: {
        xpGained: 100,
        newTotalXP: 100,
        leveledUp: false,
        newLevel: 1,
        newAchievements: [],
      },
    });
    const result = await logReadingSession(supabase, {
      bookId: 'b1',
      pagesRead: 10,
      durationMinutes: 5,
    });
    expect(result.xpGained).toBe(100);
    expect(calls).toContainEqual({
      method: 'rpc',
      args: [
        'log_reading_session',
        { p_book_id: 'b1', p_pages_read: 10, p_duration_minutes: 5 },
      ],
    });
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('boom') });
    await expect(listSessions(supabase, 'u1')).rejects.toThrow('boom');
  });
});
