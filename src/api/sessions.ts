import { apiClient } from '@/api/client';
import type {
  ExerciseLog,
  SessionCompleteResponse,
  SessionStart,
  SessionWithWorkout,
} from '@/api/types';

export function fetchSessions() {
  return apiClient
    .get<SessionWithWorkout[]>('/sessions')
    .then((res) => res.data);
}

export interface StartSessionPayload {
  workoutId: string;
  programId: string;
  startedAt?: string;
}

export function startSession(payload: StartSessionPayload) {
  return apiClient
    .post<SessionStart>('/sessions', payload)
    .then((res) => res.data);
}

export function fetchSession(sessionId: string) {
  return apiClient
    .get<SessionStart>(`/sessions/${sessionId}`)
    .then((res) => res.data);
}

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

export function logSet(sessionId: string, payload: LogSetPayload) {
  return apiClient.post<ExerciseLog>(`/sessions/${sessionId}/logs`, payload);
}

export function undoSet(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
) {
  return apiClient.delete(`/sessions/${sessionId}/logs`, {
    params: { exerciseId, setNumber },
  });
}

export function completeSession(sessionId: string, notes?: string) {
  return apiClient
    .patch<SessionCompleteResponse>(`/sessions/${sessionId}/complete`, {
      notes,
    })
    .then((res) => res.data);
}

export function discardSession(sessionId: string) {
  return apiClient.delete(`/sessions/${sessionId}`);
}
