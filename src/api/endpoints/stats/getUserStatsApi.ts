import { apiRequest } from '@/api/request/apiRequest';
import type { UserStats } from '@/api/models';

// Тот же /stats, что использует forma-next — источник streak/comeback для
// Фитнес Бро (см. src/utils/bro.ts).
export function getUserStatsApi() {
  return apiRequest<UserStats>({
    method: 'get',
    url: '/stats',
  });
}
