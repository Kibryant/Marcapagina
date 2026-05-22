import { describe, expect, it } from 'vitest';
import {
  createHighlight,
  deleteHighlight,
  deleteHighlightsByBook,
  listHighlightsByBook,
} from '../src/highlights';
import { createMockSupabase } from './mock';

describe('highlights repo', () => {
  it('listHighlightsByBook reads highlights of a book', async () => {
    const { supabase, calls } = createMockSupabase({ data: [{ id: 'h1' }] });
    expect(await listHighlightsByBook(supabase, 'b1')).toEqual([{ id: 'h1' }]);
    expect(calls).toContainEqual({ method: 'from', args: ['highlights'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['book_id', 'b1'] });
  });

  it('createHighlight inserts into highlights', async () => {
    const { supabase, calls } = createMockSupabase();
    await createHighlight(supabase, {
      user_id: 'u1',
      book_id: 'b1',
      content: 'nice',
      page: 10,
    });
    expect(calls.some((c) => c.method === 'insert')).toBe(true);
  });

  it('deleteHighlight deletes by id', async () => {
    const { supabase, calls } = createMockSupabase();
    await deleteHighlight(supabase, 'h1');
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'h1'] });
  });

  it('deleteHighlightsByBook deletes by book_id', async () => {
    const { supabase, calls } = createMockSupabase();
    await deleteHighlightsByBook(supabase, 'b1');
    expect(calls).toContainEqual({ method: 'eq', args: ['book_id', 'b1'] });
  });

  it('throws when the query errors', async () => {
    const { supabase } = createMockSupabase({ error: new Error('boom') });
    await expect(listHighlightsByBook(supabase, 'b1')).rejects.toThrow('boom');
  });
});
