import { apiRequest } from '@/shared/api/apiRequest';
import type { ReactionType } from '../models/reaction';

// Тот же /reactions, что использует forma-next — список реакций на
// программу (см. modules/programs/components/ProgramCard.tsx).
export function getReactionsApi() {
  return apiRequest<ReactionType[]>({
    method: 'get',
    url: '/reactions',
  });
}
