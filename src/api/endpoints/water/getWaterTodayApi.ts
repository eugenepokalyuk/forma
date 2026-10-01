import { apiRequest } from '@/api/request/apiRequest';
import type { WaterToday } from '@/api/models';

// Тот же /water/today, что использует forma-next — источник условия
// water_low для Фитнес Бро (см. src/utils/helpers/bro/broMessages.ts).
export function getWaterTodayApi() {
  return apiRequest<WaterToday>({
    method: 'get',
    url: '/water/today',
  });
}
