import { router } from 'expo-router';
import { Switch } from 'react-native';

import { ListGroup, ListRow, Section } from '@/shared/ui';
import { useFriendsOnly } from '@/pages/Profile/hooks/useFriendsOnly';
import { useSocialSummary } from '@/modules/social';
import { useAuthStore } from '@/modules/auth';
import { COLORS } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

export function AccountSection() {
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);
  const { friendsOnly, isPending, setFriendsOnly } = useFriendsOnly();
  const { data: socialSummary } = useSocialSummary();

  return (
    <Section title="Аккаунт" padding>
      <ListGroup>
        <ListRow
          icon="account-multiple-outline"
          title="Друзья"
          subtitle={
            socialSummary?.pendingRequests
              ? `${socialSummary.pendingRequests} новых запросов`
              : undefined
          }
          onPress={() => router.push(ROUTES.friends)}
          isFirst
        />

        <ListRow
          icon="account-lock-outline"
          title="Показывать только друзьям"
          subtitle="Посты в ленте увидят только друзья"
          showChevron={false}
          isLast
          trailing={
            <Switch
              value={friendsOnly}
              disabled={isPending}
              onValueChange={setFriendsOnly}
              trackColor={{
                false: COLORS.Surface.secondary,
                true: COLORS.Surface.accent,
              }}
              thumbColor={COLORS.White}
            />
          }
        />

        <ListRow
          icon="account-cancel-outline"
          title="Заблокированные"
          onPress={() => router.push(ROUTES.blocked)}
        />

        <ListRow
          icon={hasProAccess ? 'crown' : 'crown-outline'}
          tint={hasProAccess ? COLORS.Text.accent : undefined}
          title="Тариф"
          subtitle={hasProAccess ? 'ПРО' : 'Бесплатный'}
          showChevron={false}
        />
      </ListGroup>
    </Section>
  );
}
