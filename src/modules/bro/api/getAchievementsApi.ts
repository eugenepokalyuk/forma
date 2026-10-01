import { apiRequest } from '@/shared/api/apiRequest';
import type { AchievementsResponse } from '../models/achievement';

// Тот же /achievements, что использует forma-next — источник свежей ачивки
// для Фитнес Бро (см. modules/bro/helpers/broMessages.ts).
export function getAchievementsApi() {
  return apiRequest<AchievementsResponse>({
    method: 'get',
    url: '/achievements',
  });
}
