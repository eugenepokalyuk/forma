// См. forma-python/water и forma-next water.types.ts.
export interface WaterLogEntry {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export interface WaterToday {
  date: string;
  goalMl: number;
  baseGoalMl: number;
  consumedMl: number;
  logs: WaterLogEntry[];
}
