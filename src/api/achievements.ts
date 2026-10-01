import { apiClient } from '@/api/client';
import type { AchievementsResponse } from '@/api/types';

// Тот же /achievements, что использует forma-next — источник свежей ачивки
// для Фитнес Бро (см. src/utils/bro.ts).
export function getAchievements() {
  return apiClient
    .get<AchievementsResponse>('/achievements')
    .then((res) => res.data);
}
