import { apiClient } from '@/api/client';
import type { UserStats } from '@/api/types';

// Тот же /stats, что использует forma-next — источник streak/comeback для
// Фитнес Бро (см. src/utils/bro.ts).
export function fetchUserStats() {
  return apiClient.get<UserStats>('/stats').then((res) => res.data);
}
