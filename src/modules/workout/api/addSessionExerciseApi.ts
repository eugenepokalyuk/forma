import type { Exercise } from '@/modules/programs';
import { apiRequest } from '@/shared/api/apiRequest';

export interface AddSessionExercisePayload {
  catalogExerciseId: string;
  // true — «каждый раз в этой тренировке», false — только в этой сессии.
  persist: boolean;
  // Упражнение, сразу после которого показывать новое; null — в конец.
  afterExerciseId: string | null;
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  durationSeconds: number | null;
  restSeconds: number;
}

export function addSessionExerciseApi(
  sessionId: string,
  payload: AddSessionExercisePayload,
) {
  return apiRequest<Exercise>({
    method: 'post',
    url: `/sessions/${sessionId}/exercises`,
    data: payload,
  });
}
