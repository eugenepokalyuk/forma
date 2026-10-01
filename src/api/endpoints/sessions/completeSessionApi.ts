import { apiRequest } from '@/api/request/apiRequest';
import type { SessionCompleteResponse } from '@/api/models';

export function completeSessionApi(sessionId: string, notes?: string | null) {
  return apiRequest<SessionCompleteResponse>({
    method: 'patch',
    url: `/sessions/${sessionId}/complete`,
    data: { notes },
  });
}
