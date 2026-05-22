import { describe, expect, it } from 'vitest';
import { createGoal, deactivateGoals, getActiveGoal } from '../src/goals';
import { createMockSupabase } from './mock';

describe('goals repo', () => {
  it('getActiveGoal reads the active goal of the user', async () => {
    const { supabase, calls } = createMockSupabase({ data: { id: 'g1' } });
    expect(await getActiveGoal(supabase, 'u1')).toEqual({ id: 'g1' });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['active', true] });
  });

  it('getActiveGoal returns null when there is none', async () => {
    const { supabase } = createMockSupabase({ data: null });
    expect(await getActiveGoal(supabase, 'u1')).toBeNull();
  });

  it('deactivateGoals sets active=false for the user', async () => {
    const { supabase, calls } = createMockSupabase();
    await deactivateGoals(supabase, 'u1');
    expect(calls).toContainEqual({
      method: 'update',
      args: [{ active: false }],
    });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
  });

  it('createGoal inserts into goals', async () => {
    const { supabase, calls } = createMockSupabase();
    await createGoal(supabase, { user_id: 'u1', active: true });
    expect(calls).toContainEqual({ method: 'from', args: ['goals'] });
    expect(calls.some((c) => c.method === 'insert')).toBe(true);
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('boom') });
    await expect(deactivateGoals(supabase, 'u1')).rejects.toThrow('boom');
  });
});
