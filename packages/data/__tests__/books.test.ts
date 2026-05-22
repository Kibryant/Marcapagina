import { describe, expect, it } from 'vitest';
import {
  createBook,
  deleteBook,
  getBook,
  listBookStatuses,
  listBooks,
  listBookTitles,
  listReadingBooks,
  listUnfinishedBooks,
  updateBook,
} from '../src/books';
import { createMockSupabase } from './mock';

describe('books repo', () => {
  it('listBooks reads the user books newest-first', async () => {
    const { supabase, calls } = createMockSupabase({ data: [{ id: 'b1' }] });
    expect(await listBooks(supabase, 'u1')).toEqual([{ id: 'b1' }]);
    expect(calls).toContainEqual({ method: 'from', args: ['books'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
    expect(calls).toContainEqual({
      method: 'order',
      args: ['created_at', { ascending: false }],
    });
  });

  it('listBooks returns [] when data is null', async () => {
    const { supabase } = createMockSupabase({ data: null });
    expect(await listBooks(supabase, 'u1')).toEqual([]);
  });

  it('getBook reads a single book and returns it', async () => {
    const { supabase, calls } = createMockSupabase({ data: { id: 'b1' } });
    expect(await getBook(supabase, 'b1')).toEqual({ id: 'b1' });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'b1'] });
    expect(calls).toContainEqual({ method: 'maybeSingle', args: [] });
  });

  it('getBook returns null when not found', async () => {
    const { supabase } = createMockSupabase({ data: null });
    expect(await getBook(supabase, 'x')).toBeNull();
  });

  it('listReadingBooks filters by status reading', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listReadingBooks(supabase, 'u1');
    expect(calls).toContainEqual({ method: 'eq', args: ['status', 'reading'] });
  });

  it('listUnfinishedBooks excludes finished books', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listUnfinishedBooks(supabase, 'u1');
    expect(calls).toContainEqual({
      method: 'neq',
      args: ['status', 'finished'],
    });
  });

  it('listBookTitles selects id and title', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listBookTitles(supabase);
    expect(calls).toContainEqual({ method: 'select', args: ['id, title'] });
  });

  it('listBookStatuses selects id and status for the user', async () => {
    const { supabase, calls } = createMockSupabase({ data: [] });
    await listBookStatuses(supabase, 'u1');
    expect(calls).toContainEqual({ method: 'select', args: ['id, status'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'u1'] });
  });

  it('createBook inserts into books', async () => {
    const { supabase, calls } = createMockSupabase();
    await createBook(supabase, {
      user_id: 'u1',
      title: 'T',
      author: null,
      total_pages: 100,
      current_page: 0,
      status: 'reading',
    });
    expect(calls).toContainEqual({ method: 'from', args: ['books'] });
    expect(calls.some((c) => c.method === 'insert')).toBe(true);
  });

  it('updateBook updates by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await updateBook(supabase, 'b1', { rating: 5 });
    expect(calls).toContainEqual({ method: 'update', args: [{ rating: 5 }] });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'b1'] });
  });

  it('deleteBook deletes by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await deleteBook(supabase, 'b1');
    expect(calls.some((c) => c.method === 'delete')).toBe(true);
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'b1'] });
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('rls') });
    await expect(listBooks(supabase, 'u1')).rejects.toThrow('rls');
  });
});
