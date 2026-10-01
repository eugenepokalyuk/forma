import * as ReactQuery from '@tanstack/react-query';
import { router } from 'expo-router';
import { Switch } from 'react-native';

import { getSocialSummaryApi } from '@/api';
import { ListGroup, ListRow, Section } from '@/components/ui';
import { useFriendsOnly } from '@/pages/Profile/hooks/useFriendsOnly';
import { useAuthStore } from '@/store/auth';
import { COLORS } from '@/theme';
import { ROUTES } from '@/utils/constants/routes';

export function AccountSection() {
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);
  const { friendsOnly, isPending, setFriendsOnly } = useFriendsOnly();
  const { data: socialSummary } = ReactQuery.useQuery({
    queryKey: ['social', 'summary'],
    queryFn: getSocialSummaryApi,
  });

  return (
    <Section title="Аккаунт">
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
          icon={hasProAccess ? 'crown' : 'crown-outline'}
          tint={hasProAccess ? COLORS.Text.accent : undefined}
          title="Тариф"
          subtitle={hasProAccess ? 'ПРО' : 'Бесплатный'}
          showChevron={false}
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
      </ListGroup>
    </Section>
  );
}
