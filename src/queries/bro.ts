import * as ReactQuery from '@tanstack/react-query';

import {
  getAchievementsApi,
  getBroPhrasesApi,
  getUserStatsApi,
  getWaterTodayApi,
} from '@/api';
import { queryKeys } from '@/queries/keys';

// Источники данных для реплик Фитнес Бро.

export function useBroPhrases() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.broPhrases,
    queryFn: getBroPhrasesApi,
  });
}

export function useUserStats() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.stats,
    queryFn: getUserStatsApi,
  });
}

export function useWaterToday() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.waterToday,
    queryFn: getWaterTodayApi,
  });
}

export function useAchievements() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.achievements,
    queryFn: getAchievementsApi,
  });
}
