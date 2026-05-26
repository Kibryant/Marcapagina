import type { SupabaseClient } from '@supabase/supabase-js';

export interface StreakFreeze {
  id: string;
  user_id: string;
  granted_at: string;
  granted_for_month: string;
  consumed_at: string | null;
  consumed_for_date: string | null;
}

/** Freezes disponíveis (não consumidos) do usuário, mais antigos primeiro. */
export async function listAvailableFreezes(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakFreeze[]> {
  const { data, error } = await supabase
    .from('streak_freezes')
    .select('*')
    .eq('user_id', userId)
    .is('consumed_at', null)
    .order('granted_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as StreakFreeze[];
}

/** Datas cobertas por freezes consumidos — usado pelo getStreak(). */
export async function listConsumedFreezeDates(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('streak_freezes')
    .select('consumed_for_date')
    .eq('user_id', userId)
    .not('consumed_for_date', 'is', null);
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.consumed_for_date as string | null)
    .filter((d): d is string => d !== null);
}

/**
 * Consome um freeze disponível para cobrir uma data específica. Validado
 * server-side: data dentro dos últimos 2 dias, sem leitura, sem freeze
 * duplicado, com freeze disponível.
 */
export async function consumeStreakFreeze(
  supabase: SupabaseClient,
  date: string
): Promise<{ freezeId: string; coveredDate: string }> {
  const { data, error } = await supabase.rpc('consume_streak_freeze', {
    p_date: date,
  });
  if (error) throw error;
  return data as { freezeId: string; coveredDate: string };
}
