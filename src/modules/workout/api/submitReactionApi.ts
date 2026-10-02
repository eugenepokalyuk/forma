import type { ReactionValue } from '@/modules/programs';
import { apiRequest } from '@/shared/api/apiRequest';

export function submitReactionApi(sessionId: string, reaction: ReactionValue) {
  return apiRequest<void>({
    method: 'patch',
    url: `/sessions/${sessionId}/reaction`,
    data: { reaction },
  });
}
