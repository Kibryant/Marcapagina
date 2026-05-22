import { describe, expect, it } from 'vitest';
import {
  getProfile,
  getPublicProfile,
  listFollowsForUser,
  updateProfile,
} from '../src/profiles';
import { createMockSupabase } from './mock';

describe('profiles repo', () => {
  it('getProfile reads the profile by id', async () => {
    const { supabase, calls } = createMockSupabase({ data: { id: 'u1' } });
    expect(await getProfile(supabase, 'u1')).toEqual({ id: 'u1' });
    expect(calls).toContainEqual({ method: 'from', args: ['profiles'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'u1'] });
  });

  it('getProfile returns null when not found', async () => {
    const { supabase } = createMockSupabase({ data: null });
    expect(await getProfile(supabase, 'x')).toBeNull();
  });

  it('getPublicProfile reads by username with the favorite book', async () => {
    const { supabase, calls } = createMockSupabase({ data: { id: 'u1' } });
    await getPublicProfile(supabase, 'arthur');
    expect(calls).toContainEqual({
      method: 'eq',
      args: ['username', 'arthur'],
    });
    expect(calls).toContainEqual({
      method: 'select',
      args: ['*, favorite_book:books(title, author)'],
    });
  });

  it('updateProfile updates by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await updateProfile(supabase, 'u1', { display_name: 'A' });
    expect(calls).toContainEqual({
      method: 'update',
      args: [{ display_name: 'A' }],
    });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'u1'] });
  });

  it('listFollowsForUser queries the follows table', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listFollowsForUser(supabase, 'u1');
    expect(calls).toContainEqual({ method: 'from', args: ['follows'] });
    expect(calls.some((c) => c.method === 'or')).toBe(true);
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('boom') });
    await expect(updateProfile(supabase, 'u1', {})).rejects.toThrow('boom');
  });
});
