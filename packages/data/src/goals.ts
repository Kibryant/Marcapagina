import type { Goal } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NewGoal = Partial<Goal> & { user_id: string; active: boolean };

/** Meta ativa do usuário, ou null se não houver. */
export async function getActiveGoal(
  supabase: SupabaseClient,
  userId: string
): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return (data as Goal) ?? null;
}

/** Desativa todas as metas do usuário (antes de criar uma nova). */
export async function deactivateGoals(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ active: false })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function createGoal(
  supabase: SupabaseClient,
  input: NewGoal
): Promise<void> {
  const { error } = await supabase.from('goals').insert(input);
  if (error) throw error;
}
