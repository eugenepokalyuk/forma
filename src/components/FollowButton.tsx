import * as ReactQuery from '@tanstack/react-query';

import { followUserApi, unfollowUserApi } from '@/api';
import type { PublicUser } from '@/api';
import { Button } from '@/components/Button';

interface FollowButtonProps {
  user: PublicUser;
}

// Состояние берём прямо из PublicUser (isFollowing/isRequested) — сервер
// сам решает active/pending по приватности аккаунта (см. FollowActionView).
export function FollowButton({ user }: FollowButtonProps) {
  const queryClient = ReactQuery.useQueryClient();

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ['social'] });

  const followMutation = ReactQuery.useMutation({
    mutationFn: () => followUserApi(user.id),
    onSuccess: invalidate,
  });
  const unfollowMutation = ReactQuery.useMutation({
    mutationFn: () => unfollowUserApi(user.id),
    onSuccess: invalidate,
  });

  if (user.isSelf) return null;

  const active = user.isFollowing || user.isRequested;
  const title = user.isFollowing
    ? 'Вы подписаны'
    : user.isRequested
      ? 'Запрос отправлен'
      : 'Подписаться';
  const pending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <Button
      title={title}
      variant={active ? 'secondary' : 'primary'}
      loading={pending}
      onPress={() =>
        active ? unfollowMutation.mutate() : followMutation.mutate()
      }
      style={{ minWidth: 140 }}
    />
  );
}
