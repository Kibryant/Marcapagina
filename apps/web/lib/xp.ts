export const XP_PER_PAGE = 10;
export const XP_PER_MINUTE = 5;
export const XP_TO_NEXT_LEVEL = 1000;

export function calculateLevel(totalXP: number) {
  return Math.floor(totalXP / XP_TO_NEXT_LEVEL) + 1;
}

export function getXPProgress(totalXP: number) {
  return Math.round(((totalXP % XP_TO_NEXT_LEVEL) / XP_TO_NEXT_LEVEL) * 100);
}
