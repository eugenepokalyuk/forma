import { apiClient } from '@/api/client';
import type { Program, ProgramWithWorkouts, UserProgram } from '@/api/types';

export function getCatalog() {
  return apiClient.get<Program[]>('/programs').then((res) => res.data);
}

export function getProgram(id: string) {
  return apiClient
    .get<ProgramWithWorkouts>(`/programs/${id}`)
    .then((res) => res.data);
}

export function getUserPrograms() {
  return apiClient.get<UserProgram[]>('/user-programs').then((res) => res.data);
}

export function addUserProgram(programId: string) {
  return apiClient.post<UserProgram>('/user-programs', { programId });
}
