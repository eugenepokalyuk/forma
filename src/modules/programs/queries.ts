import * as ReactQuery from '@tanstack/react-query';
import axios from 'axios';
import { Alert } from 'react-native';

import { addUserProgramApi } from './api/addUserProgramApi';
import { getCatalogApi } from './api/getCatalogApi';
import { getProgramApi } from './api/getProgramApi';
import { getReactionsApi } from './api/getReactionsApi';
import { getUserProgramsApi } from './api/getUserProgramsApi';
import type { ProgramWithWorkouts } from './models/program';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const programKeys = {
  userPrograms: ['userPrograms'] as const,
  detail: (id: string | undefined) => ['program', id] as const,
  catalog: ['catalog'] as const,
  reactions: ['reactions'] as const,
};

export function useUserPrograms() {
  return ReactQuery.useQuery({
    queryKey: programKeys.userPrograms,
    queryFn: getUserProgramsApi,
  });
}

export function useCatalog() {
  return ReactQuery.useQuery({
    queryKey: programKeys.catalog,
    queryFn: getCatalogApi,
  });
}

export function programQueryOptions(id: string) {
  return {
    queryKey: programKeys.detail(id),
    queryFn: () => getProgramApi(id),
  };
}

export function useProgram(id: string | undefined) {
  return ReactQuery.useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getProgramApi(id!),
    enabled: !!id,
  });
}

// Программа из кэша без запроса — экран тренировки открывается только
// после страницы программы, где она уже загружена.
export function useCachedProgram(id: string | undefined) {
  const queryClient = ReactQuery.useQueryClient();
  return queryClient.getQueryData<ProgramWithWorkouts>(programKeys.detail(id));
}

export function useAddUserProgram(programId: string) {
  const queryClient = ReactQuery.useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: programKeys.userPrograms });

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

// Справочник реакций не меняется за время жизни приложения.
export function useReactions() {
  return ReactQuery.useQuery({
    queryKey: programKeys.reactions,
    queryFn: getReactionsApi,
    staleTime: Infinity,
  });
}
