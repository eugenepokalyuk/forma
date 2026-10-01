import * as ReactQuery from '@tanstack/react-query';

import { updateProfileApi } from './api/updateProfileApi';
import { alertActionFailed } from '@/shared/ui';

import { useAuthStore } from './store';

// Текущий пользователь живёт в auth-сторе (нужен до загрузки экранов),
// поэтому ответ мутации кладём туда же.
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return ReactQuery.useMutation({
    mutationFn: updateProfileApi,
    onSuccess: setUser,
    // Значение в сторе не менялось — переключатель сам вернётся назад.
    onError: () => alertActionFailed('сохранить настройки'),
  });
}
