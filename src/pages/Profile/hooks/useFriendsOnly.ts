import { useUpdateProfile } from '@/modules/auth';
import { useAuthStore } from '@/modules/auth';

// Настройка «Показывать только друзьям».
export function useFriendsOnly() {
  const isPublic = useAuthStore((s) => s.user?.isPublic);
  const mutation = useUpdateProfile();

  return {
    // По умолчанию выключено — isPublic на бэке по умолчанию true, поэтому
    // «только друзьям» считаем включённым лишь при явном isPublic === false.
    friendsOnly: isPublic === false,
    isPending: mutation.isPending,
    setFriendsOnly: (value: boolean) => mutation.mutate({ isPublic: !value }),
  };
}
