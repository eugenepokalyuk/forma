import { apiRequest } from '@/api/request/apiRequest';
import type { SessionStart } from '@/api/models';

export function getSessionApi(sessionId: string) {
  return apiRequest<SessionStart>({
    method: 'get',
    url: `/sessions/${sessionId}`,
  });
}
