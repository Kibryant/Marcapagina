import { createClient } from './supabase/client';

export const XP_PER_PAGE = 10;
export const XP_PER_MINUTE = 5;
export const XP_TO_NEXT_LEVEL = 1000;

export function calculateLevel(totalXP: number) {
  return Math.floor(totalXP / XP_TO_NEXT_LEVEL) + 1;
}

export function getXPProgress(totalXP: number) {
  return Math.round(((totalXP % XP_TO_NEXT_LEVEL) / XP_TO_NEXT_LEVEL) * 100);
}

export interface XPUpdateResult {
  xpGained: number;
  newTotalXP: number;
  leveledUp: boolean;
  newLevel: number;
  newAchievements: string[];
}

export async function processReadingXP(
  userId: string,
  pagesRead: number,
  durationMinutes: number
): Promise<XPUpdateResult> {
  const supabase = createClient();

  // 1. Calculate XP Gained
  const xpGained = pagesRead * XP_PER_PAGE + durationMinutes * XP_PER_MINUTE;

  // 2. Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single();

  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const newTotalXP = currentXP + xpGained;
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > currentLevel;

  // 3. Update profile
  await supabase
    .from('profiles')
    .update({
      xp: newTotalXP,
      level: newLevel,
    })
    .eq('id', userId);

  // 4. Achievement Checks (Basic logic for now)
  const newAchievements: string[] = [];

  // Example Check: First Log
  const { count: sessionCount } = await supabase
    .from('reading_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (sessionCount === 1) {
    const { data: ach } = await supabase
      .from('achievements')
      .select('*')
      .eq('criteria_type', 'first_log')
      .single();

    if (ach) {
      const { error: achErr } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: ach.id });

      if (!achErr) newAchievements.push(ach.name);
    }
  }

  // Example Check: Night Owl (00:00 - 04:00)
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 4) {
    const { data: ach } = await supabase
      .from('achievements')
      .select('*')
      .eq('criteria_type', 'night_owl')
      .single();

    if (ach) {
      const { error: achErr } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: ach.id });

      if (!achErr) newAchievements.push(ach.name);
    }
  }

  return {
    xpGained,
    newTotalXP,
    leveledUp,
    newLevel,
    newAchievements,
  };
}
