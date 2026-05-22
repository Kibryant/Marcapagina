import { describe, expect, it } from 'vitest';
import { listAchievements, listUserAchievements } from '../src/achievements';
import { createMockSupabase } from './mock';

describe('achievements repo', () => {
  it('listAchievements reads every achievement', async () => {
    const { supabase, calls } = createMockSupabase({ data: [{ id: 'a1' }] });
    expect(await listAchievements(supabase)).toEqual([{ id: 'a1' }]);
    expect(calls).toContainEqual({ method: 'from', args: ['achievements'] });
  });

  it('listUserAchievements filters by user', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listUserAchievements(supabase, 'u1');
    expect(calls).toContainEqual({
      method: 'from',
      args: ['user_achievements'],
    });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
  });

  it('returns [] when data is null', async () => {
    const { supabase } = createMockSupabase({ data: null });
    expect(await listAchievements(supabase)).toEqual([]);
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('boom') });
    await expect(listAchievements(supabase)).rejects.toThrow('boom');
  });
});
