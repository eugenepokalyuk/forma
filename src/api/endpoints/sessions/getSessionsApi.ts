import { apiRequest } from '@/api/request/apiRequest';
import type { SessionWithWorkout } from '@/api/models';

export function getSessionsApi() {
  return apiRequest<SessionWithWorkout[]>({
    method: 'get',
    url: '/sessions',
  });
}
