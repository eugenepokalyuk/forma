import { apiRequest } from '@/shared/api/apiRequest';
import type { ProgramWithWorkouts } from '../models/program';

export function getProgramApi(id: string) {
  return apiRequest<ProgramWithWorkouts>({
    method: 'get',
    url: `/programs/${id}`,
  });
}
