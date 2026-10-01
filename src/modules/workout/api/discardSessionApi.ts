import { apiRequest } from '@/shared/api/apiRequest';

export function discardSessionApi(sessionId: string) {
  return apiRequest<void>({
    method: 'delete',
    url: `/sessions/${sessionId}`,
  });
}
