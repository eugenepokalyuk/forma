import { apiRequest } from '@/api/request/apiRequest';
import type { LastLog } from '@/api/models';

export function getLastLogApi(catalogExerciseId: string) {
  return apiRequest<LastLog[]>({
    method: 'get',
    url: `/exercises/${catalogExerciseId}/last-log`,
  });
}
