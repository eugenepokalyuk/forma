import * as ReactQuery from '@tanstack/react-query';

import { updateProfileApi } from '@/api';
import { useAuthStore } from '@/store/auth';

// Настройка «Показывать только друзьям».
export function useFriendsOnly() {
  const isPublic = useAuthStore((s) => s.user?.isPublic);
  const setUser = useAuthStore((s) => s.setUser);

  const mutation = ReactQuery.useMutation({
    mutationFn: updateProfileApi,
    onSuccess: setUser,
  });

  return {
    // По умолчанию выключено — isPublic на бэке по умолчанию true, поэтому
    // «только друзьям» считаем включённым лишь при явном isPublic === false.
    friendsOnly: isPublic === false,
    isPending: mutation.isPending,
    setFriendsOnly: (value: boolean) => mutation.mutate({ isPublic: !value }),
  };
}
