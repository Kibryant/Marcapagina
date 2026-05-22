import type { Achievement, UserAchievement } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Subconjunto de user_achievements usado pela UI. */
export type UnlockedAchievement = Pick<
  UserAchievement,
  'achievement_id' | 'unlocked_at'
>;

/** Todas as conquistas existentes. */
export async function listAchievements(
  supabase: SupabaseClient
): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Achievement[];
}

/** Conquistas desbloqueadas por um usuário. */
export async function listUserAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<UnlockedAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as UnlockedAchievement[];
}
