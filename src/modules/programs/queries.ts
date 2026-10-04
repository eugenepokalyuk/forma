import * as ReactQuery from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Alert } from 'react-native';

import { addUserProgramApi } from './api/addUserProgramApi';
import { getCatalogApi } from './api/getCatalogApi';
import { getExerciseCatalogApi } from './api/getExerciseCatalogApi';
import { getProgramApi } from './api/getProgramApi';
import { getReactionsApi } from './api/getReactionsApi';
import { getUserProgramsApi } from './api/getUserProgramsApi';
import { removeUserProgramApi } from './api/removeUserProgramApi';
import type { ProgramWithWorkouts, UserProgram } from './models/program';
import { alertActionFailed } from '@/shared/lib/alerts/alertActionFailed';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const programKeys = {
  userPrograms: ['userPrograms'] as const,
  detail: (id: string | undefined) => ['program', id] as const,
  catalog: ['catalog'] as const,
  reactions: ['reactions'] as const,
  exerciseCatalog: ['exerciseCatalog'] as const,
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

// Каталог упражнений (~550 штук) меняется редко: держим сутки и в кэше на
// устройстве — замена и добавление упражнения работают в зале без сети.
export const exerciseCatalogQueryOptions = {
  queryKey: programKeys.exerciseCatalog,
  queryFn: getExerciseCatalogApi,
  staleTime: 24 * 60 * 60 * 1000,
};

export function useExerciseCatalog() {
  return ReactQuery.useQuery(exerciseCatalogQueryOptions);
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
      if (isAxiosError(e) && e.response?.status === 409) {
        invalidate();
        return;
      }
      Alert.alert('Не получилось добавить программу');
    },
  });
}

// Убирает программу из «Моих программ». Из списка убираем сразу, при ошибке
// возвращаем как было.
export function useRemoveUserProgram() {
  const queryClient = ReactQuery.useQueryClient();
  const key = programKeys.userPrograms;

  return ReactQuery.useMutation({
    mutationFn: removeUserProgramApi,
    onMutate: async (userProgramId: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserProgram[]>(key);
      queryClient.setQueryData<UserProgram[]>(key, (list) =>
        list?.filter((up) => up.id !== userProgramId),
      );
      return { previous };
    },
    onError: (_e, _id, context) => {
      queryClient.setQueryData(key, context?.previous);
      alertActionFailed('отписаться от программы');
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
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
