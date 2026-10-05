// XP required to go from `level` to `level + 1`.
export function xpForLevel(level: number): number {
  return 80 + (level - 1) * 35;
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpToNext: number } {
  let level = 1;
  let remaining = totalXp;
  let need = xpForLevel(level);
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = xpForLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpToNext: need };
}

export const XP_PER_MINUTE = 4;
export const COINS_PER_MINUTE = 2;
export const XP_SESSION_BONUS = 15;
export const COINS_SESSION_BONUS = 10;
