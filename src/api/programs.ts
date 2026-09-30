import { apiClient } from '@/api/client';
import type { Program, ProgramWithWorkouts, UserProgram } from '@/api/types';

// TODO: Нужно все названия функций (про директорию api, а не про текущий файл) переименовать с fetch на get, не вижу смысловой нагрузки писать fetch когда есть слово get
export function fetchCatalog() {
  return apiClient.get<Program[]>('/programs').then((res) => res.data);
}

export function fetchProgram(id: string) {
  return apiClient
    .get<ProgramWithWorkouts>(`/programs/${id}`)
    .then((res) => res.data);
}

export function fetchUserPrograms() {
  return apiClient.get<UserProgram[]>('/user-programs').then((res) => res.data);
}

export function addUserProgram(programId: string) {
  return apiClient.post<UserProgram>('/user-programs', { programId });
}
