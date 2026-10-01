import { apiRequest } from '@/shared/api/apiRequest';
import type { LastLog } from '../models/session';

export function getLastLogApi(catalogExerciseId: string) {
  return apiRequest<LastLog[]>({
    method: 'get',
    url: `/exercises/${catalogExerciseId}/last-log`,
  });
}
