import * as ReactQuery from '@tanstack/react-query';
import axios from 'axios';
import { Alert } from 'react-native';

import {
  addUserProgramApi,
  getCatalogApi,
  getProgramApi,
  getUserProgramsApi,
  type ProgramWithWorkouts,
} from '@/api';
import { queryKeys } from '@/queries/keys';

export function useUserPrograms() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.userPrograms,
    queryFn: getUserProgramsApi,
  });
}

export function useCatalog() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.catalog,
    queryFn: getCatalogApi,
  });
}

export function programQueryOptions(id: string) {
  return {
    queryKey: queryKeys.program(id),
    queryFn: () => getProgramApi(id),
  };
}

export function useProgram(id: string | undefined) {
  return ReactQuery.useQuery({
    queryKey: queryKeys.program(id),
    queryFn: () => getProgramApi(id!),
    enabled: !!id,
  });
}

// Программа из кэша без запроса — экран тренировки открывается только
// после страницы программы, где она уже загружена.
export function useCachedProgram(id: string | undefined) {
  const queryClient = ReactQuery.useQueryClient();
  return queryClient.getQueryData<ProgramWithWorkouts>(queryKeys.program(id));
}

export function useAddUserProgram(programId: string) {
  const queryClient = ReactQuery.useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: queryKeys.userPrograms });

  return ReactQuery.useMutation({
    mutationFn: () => addUserProgramApi(programId),
    onSuccess: invalidate,
    onError: (e) => {
      // 409 — программа уже добавлена: просто обновляем список.
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        invalidate();
        return;
      }
      Alert.alert('Не получилось добавить программу');
    },
  });
}
