import { apiRequest } from '@/api/request/apiRequest';
import type { ReactionType } from '@/api/models';

// Тот же /reactions, что использует forma-next — список реакций на
// программу (см. src/components/ProgramCard.tsx).
export function getReactionsApi() {
  return apiRequest<ReactionType[]>({
    method: 'get',
    url: '/reactions',
  });
}
