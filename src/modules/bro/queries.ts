import * as ReactQuery from '@tanstack/react-query';

import { getAchievementsApi } from './api/getAchievementsApi';
import { getBroPhrasesApi } from './api/getBroPhrasesApi';
import { getUserStatsApi } from './api/getUserStatsApi';
import { getWaterTodayApi } from './api/getWaterTodayApi';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const broKeys = {
  phrases: ['broPhrases'] as const,
  stats: ['stats'] as const,
  waterToday: ['water', 'today'] as const,
  achievements: ['achievements'] as const,
};

// Источники данных для реплик Фитнес Бро.

export function useBroPhrases() {
  return ReactQuery.useQuery({
    queryKey: broKeys.phrases,
    queryFn: getBroPhrasesApi,
  });
}

export function useUserStats() {
  return ReactQuery.useQuery({
    queryKey: broKeys.stats,
    queryFn: getUserStatsApi,
  });
}

export function useWaterToday() {
  return ReactQuery.useQuery({
    queryKey: broKeys.waterToday,
    queryFn: getWaterTodayApi,
  });
}

export function useAchievements() {
  return ReactQuery.useQuery({
    queryKey: broKeys.achievements,
    queryFn: getAchievementsApi,
  });
}
