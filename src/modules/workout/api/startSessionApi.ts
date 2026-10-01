import { apiRequest } from '@/shared/api/apiRequest';
import type { SessionStart } from '../models/session';

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
