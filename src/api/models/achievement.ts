// См. forma-python/achievements и forma-next achievements.types.ts.
export interface AchievementTier {
  rank: number;
  title: string;
  threshold: number;
  bonus: number;
  earned: boolean;
  earnedAt: string | null;
}

export interface Achievement {
  metric: string;
  name: string;
  description: string;
  emoji: string;
  value: number;
  currentRank: number;
  maxRank: number;
  nextThreshold: number | null;
  tiers: AchievementTier[];
}

export interface AchievementsResponse {
  formBonus: number;
  earnedCount: number;
  achievements: Achievement[];
}
