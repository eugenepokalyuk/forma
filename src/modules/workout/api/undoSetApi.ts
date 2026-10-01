import { apiRequest } from '@/shared/api/apiRequest';

export function undoSetApi(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
) {
  return apiRequest<void>({
    method: 'delete',
    url: `/sessions/${sessionId}/logs`,
    params: { exerciseId, setNumber },
  });
}
