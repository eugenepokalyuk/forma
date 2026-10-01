import { apiRequest } from '@/shared/api/apiRequest';
import type { SessionCompleteResponse } from '../models/session';

export function completeSessionApi(sessionId: string, notes?: string | null) {
  return apiRequest<SessionCompleteResponse>({
    method: 'patch',
    url: `/sessions/${sessionId}/complete`,
    data: { notes },
  });
}
