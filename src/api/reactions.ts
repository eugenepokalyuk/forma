import { apiClient } from '@/api/client';
import type { ReactionType } from '@/api/types';

// Тот же /reactions, что использует forma-next — список реакций на
// программу (см. src/components/ProgramCard.tsx).
export function fetchReactions() {
  return apiClient.get<ReactionType[]>('/reactions').then((res) => res.data);
}
