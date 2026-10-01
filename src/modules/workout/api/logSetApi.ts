import { apiRequest } from '@/shared/api/apiRequest';
import type { ExerciseLog } from '../models/session';

export interface LogSetPayload {
  clientId: string;
  exerciseId: string;
  setNumber: number;
  repsDone?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  skipped?: boolean;
  notes?: string | null;
  loggedAt?: string;
  actualCatalogExerciseId?: string | null;
}

export function logSetApi(sessionId: string, payload: LogSetPayload) {
  return apiRequest<ExerciseLog>({
    method: 'post',
    url: `/sessions/${sessionId}/logs`,
    data: payload,
  });
}
