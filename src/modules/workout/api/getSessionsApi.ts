import { apiRequest } from '@/shared/api/apiRequest';
import type { SessionWithWorkout } from '../models/session';

export function getSessionsApi() {
  return apiRequest<SessionWithWorkout[]>({
    method: 'get',
    url: '/sessions',
  });
}
