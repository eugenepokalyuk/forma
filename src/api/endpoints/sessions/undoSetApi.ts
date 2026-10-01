import { apiRequest } from '@/api/request/apiRequest';

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
