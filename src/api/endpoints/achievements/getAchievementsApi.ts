import { apiRequest } from '@/api/request/apiRequest';
import type { AchievementsResponse } from '@/api/models';

// Тот же /achievements, что использует forma-next — источник свежей ачивки
// для Фитнес Бро (см. src/utils/bro.ts).
export function getAchievementsApi() {
  return apiRequest<AchievementsResponse>({
    method: 'get',
    url: '/achievements',
  });
}
