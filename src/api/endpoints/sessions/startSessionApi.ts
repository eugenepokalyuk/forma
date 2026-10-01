import { apiRequest } from '@/api/request/apiRequest';
import type { SessionStart } from '@/api/models';

export interface StartSessionPayload {
  workoutId: string;
  programId: string;
  startedAt?: string;
}

export function startSessionApi(payload: StartSessionPayload) {
  return apiRequest<SessionStart>({
    method: 'post',
    url: '/sessions',
    data: payload,
  });
}
