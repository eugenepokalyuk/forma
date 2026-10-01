import { apiClient } from '@/api/client';
import type { WaterToday } from '@/api/types';

// Тот же /water/today, что использует forma-next — источник условия
// water_low для Фитнес Бро (см. src/utils/bro.ts).
export function getWaterToday() {
  return apiClient.get<WaterToday>('/water/today').then((res) => res.data);
}
