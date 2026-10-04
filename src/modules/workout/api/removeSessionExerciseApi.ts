import { apiRequest } from '@/shared/api/apiRequest';

// Убирает своё упражнение из тренировки: и разовое, и «каждый раз».
export function removeSessionExerciseApi(
  sessionId: string,
  exerciseId: string,
) {
  return apiRequest<void>({
    method: 'delete',
    url: `/sessions/${sessionId}/exercises/${exerciseId}`,
  });
}
