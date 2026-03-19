import { getStreak } from '@marcapagina/shared';
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

  // 4. Fetch all achievements and user's current achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const ownedAchievementIds = new Set(
    userAchievements?.map((ua) => ua.achievement_id) || []
  );
  const newAchievements: string[] = [];

  if (allAchievements) {
    // Fetch data for criteria evaluation
    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId);

    const { count: booksFinished } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'finished');

    const { count: totalBooks } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const today = new Date().toISOString().split('T')[0];
    const pagesToday =
      sessions
        ?.filter((s) => s.date === today)
        .reduce((sum, s) => sum + s.pages_read, 0) || 0;
    const currentStreak = sessions ? getStreak(sessions) : 0;
    const hour = new Date().getHours();

    for (const ach of allAchievements) {
      if (ownedAchievementIds.has(ach.id)) continue;

      let isEligible = false;
      switch (ach.criteria_type) {
        case 'first_log':
          isEligible = (sessions?.length || 0) >= 1;
          break;
        case 'streak':
          isEligible = currentStreak >= (ach.criteria_value || 3);
          break;
        case 'pages_day':
          isEligible = pagesToday >= (ach.criteria_value || 100);
          break;
        case 'night_owl':
          isEligible = hour >= 0 && hour <= 4;
          break;
        case 'books_finished':
          isEligible = (booksFinished || 0) >= (ach.criteria_value || 1);
          break;
        case 'books_added':
          isEligible = (totalBooks || 0) >= (ach.criteria_value || 5);
          break;
      }

      if (isEligible) {
        const { error: insErr } = await supabase
          .from('user_achievements')
          .insert({ user_id: userId, achievement_id: ach.id });

        if (!insErr) {
          newAchievements.push(ach.name);
        }
      }
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
