import { apiRequest } from '@/shared/api/apiRequest';
import type { SessionStart } from '../models/session';

export function getSessionApi(sessionId: string) {
  return apiRequest<SessionStart>({
    method: 'get',
    url: `/sessions/${sessionId}`,
  });
}
