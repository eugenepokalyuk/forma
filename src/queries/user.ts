import * as ReactQuery from '@tanstack/react-query';

import { updateProfileApi } from '@/api';
import { useAuthStore } from '@/store/auth';

// Текущий пользователь живёт в auth-сторе (нужен до загрузки экранов),
// поэтому ответ мутации кладём туда же.
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return ReactQuery.useMutation({
    mutationFn: updateProfileApi,
    onSuccess: setUser,
  });
}
