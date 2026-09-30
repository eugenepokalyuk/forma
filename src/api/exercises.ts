import { apiClient } from '@/api/client';
import type { LastLog } from '@/api/types';

export function fetchLastLog(catalogExerciseId: string) {
  return apiClient
    .get<LastLog[]>(`/exercises/${catalogExerciseId}/last-log`)
    .then((res) => res.data);
}
