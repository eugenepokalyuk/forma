import { apiRequest } from '@/api/request/apiRequest';

export function discardSessionApi(sessionId: string) {
  return apiRequest<void>({
    method: 'delete',
    url: `/sessions/${sessionId}`,
  });
}
