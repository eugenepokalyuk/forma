// См. forma-python/forma (StatsRoute.Stats) и forma-next stats.types.ts.
export interface ComebackState {
  active: boolean;
  streakAtRisk: number;
  daysNeeded: number;
  daysDone: number;
}

export interface UserStats {
  streak: number;
  bestStreak: number;
  streakFrozen: boolean;
  comeback: ComebackState | null;
  weeklyCompletion: number;
  monthlyHours: number;
  weeklyActivity: number[];
  trainedToday: boolean;
}
