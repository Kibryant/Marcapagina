import type { ReadingSession } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NewSession = {
  user_id: string;
  book_id: string;
  pages_read: number;
  duration_minutes?: number;
  date: string;
};

export type LogReadingInput = {
  bookId: string;
  pagesRead: number;
  durationMinutes: number;
};

/** Resultado da RPC log_reading_session. */
export type LogReadingResult = {
  xpGained: number;
  newTotalXP: number;
  leveledUp: boolean;
  newLevel: number;
  newAchievements: string[];
};

/** Todas as sessões do usuário, mais recentes primeiro. */
export async function listSessions(
  supabase: SupabaseClient,
  userId: string
): Promise<ReadingSession[]> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReadingSession[];
}

/** Sessões de um livro específico, mais recentes primeiro. */
export async function listSessionsByBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<ReadingSession[]> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('book_id', bookId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReadingSession[];
}

export async function createSession(
  supabase: SupabaseClient,
  input: NewSession
): Promise<void> {
  const { error } = await supabase.from('reading_sessions').insert(input);
  if (error) throw error;
}

export async function updateSession(
  supabase: SupabaseClient,
  sessionId: string,
  patch: { pages_read?: number; date?: string }
): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .update(patch)
    .eq('id', sessionId);
  if (error) throw error;
}

export async function deleteSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
}

export async function deleteSessionsByBook(
  supabase: SupabaseClient,
  bookId: string
): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .delete()
    .eq('book_id', bookId);
  if (error) throw error;
}

/**
 * Registra uma leitura de forma atômica via RPC: insere a sessão, atualiza o
 * livro, processa XP/nível e conquistas. Ver supabase/migrations/.
 */
export async function logReadingSession(
  supabase: SupabaseClient,
  input: LogReadingInput
): Promise<LogReadingResult> {
  const { data, error } = await supabase.rpc('log_reading_session', {
    p_book_id: input.bookId,
    p_pages_read: input.pagesRead,
    p_duration_minutes: input.durationMinutes,
  });
  if (error) throw error;
  return data as LogReadingResult;
}
