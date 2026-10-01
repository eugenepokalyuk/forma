import type { PublicUser } from '@/modules/social';
import { Button } from '@/shared/ui';
import { useFollowUser, useUnfollowUser } from '@/modules/social';

interface FollowButtonProps {
  user: PublicUser;
}

// Состояние берём прямо из PublicUser (isFollowing/isRequested) — сервер
// сам решает active/pending по приватности аккаунта (см. FollowActionView).
export function FollowButton({ user }: FollowButtonProps) {
  const followMutation = useFollowUser(user.id);
  const unfollowMutation = useUnfollowUser(user.id);

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
