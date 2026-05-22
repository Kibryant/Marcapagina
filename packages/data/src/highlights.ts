import type { Highlight } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NewHighlight = {
  user_id: string;
  book_id: string;
  content: string;
  page: number | null;
};

/** Trechos/notas de um livro, mais recentes primeiro. */
export async function listHighlightsByBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Highlight[];
}

export async function createHighlight(
  supabase: SupabaseClient,
  input: NewHighlight
): Promise<void> {
  const { error } = await supabase.from('highlights').insert(input);
  if (error) throw error;
}

export async function deleteHighlight(
  supabase: SupabaseClient,
  highlightId: string
): Promise<void> {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', highlightId);
  if (error) throw error;
}

export async function deleteHighlightsByBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<void> {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('book_id', bookId);
  if (error) throw error;
}
