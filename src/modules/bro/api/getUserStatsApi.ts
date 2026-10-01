import { apiRequest } from '@/shared/api/apiRequest';
import type { UserStats } from '../models/stats';

// Тот же /stats, что использует forma-next — источник streak/comeback для
// Фитнес Бро (см. modules/bro/helpers/broMessages.ts).
export function getUserStatsApi() {
  return apiRequest<UserStats>({
    method: 'get',
    url: '/stats',
  });
}
