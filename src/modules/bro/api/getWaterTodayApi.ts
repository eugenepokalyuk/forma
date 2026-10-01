import { apiRequest } from '@/shared/api/apiRequest';
import type { WaterToday } from '../models/water';

// Тот же /water/today, что использует forma-next — источник условия
// water_low для Фитнес Бро (см. modules/bro/helpers/broMessages.ts).
export function getWaterTodayApi() {
  return apiRequest<WaterToday>({
    method: 'get',
    url: '/water/today',
  });
}
