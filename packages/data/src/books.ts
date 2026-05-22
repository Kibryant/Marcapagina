import type { Book } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NewBook = {
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number;
  current_page: number;
  status: Book['status'];
  category?: string | null;
  cover_url?: string | null;
};

/** Todos os livros do usuário, mais recentes primeiro. */
export async function listBooks(
  supabase: SupabaseClient,
  userId: string
): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Book[];
}

/** Um livro pelo id, ou null se não existir. */
export async function getBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .maybeSingle();
  if (error) throw error;
  return (data as Book) ?? null;
}

/** Livros não finalizados do usuário, ordenados por título (tela de registro). */
export async function listUnfinishedBooks(
  supabase: SupabaseClient,
  userId: string
): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'finished')
    .order('title');
  if (error) throw error;
  return (data ?? []) as Book[];
}

/** id + título de cada livro (para selects). */
export async function listBookTitles(
  supabase: SupabaseClient
): Promise<Pick<Book, 'id' | 'title'>[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, title')
    .order('title');
  if (error) throw error;
  return (data ?? []) as Pick<Book, 'id' | 'title'>[];
}

/** id + status de cada livro do usuário (métricas da Retrospectiva). */
export async function listBookStatuses(
  supabase: SupabaseClient,
  userId: string
): Promise<Pick<Book, 'id' | 'status'>[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, status')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as Pick<Book, 'id' | 'status'>[];
}

export async function createBook(
  supabase: SupabaseClient,
  input: NewBook
): Promise<void> {
  const { error } = await supabase.from('books').insert(input);
  if (error) throw error;
}

export async function updateBook(
  supabase: SupabaseClient,
  bookId: string,
  patch: Partial<Book>
): Promise<void> {
  const { error } = await supabase.from('books').update(patch).eq('id', bookId);
  if (error) throw error;
}

export async function deleteBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
}
