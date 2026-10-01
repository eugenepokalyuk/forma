import { apiRequest } from '@/api/request/apiRequest';
import type { ProgramWithWorkouts } from '@/api/models';

export function getProgramApi(id: string) {
  return apiRequest<ProgramWithWorkouts>({
    method: 'get',
    url: `/programs/${id}`,
  });
}
