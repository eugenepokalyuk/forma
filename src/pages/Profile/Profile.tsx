import * as ReactQuery from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as React from 'react';
import { Switch, View, StyleSheet } from 'react-native';

import { getSessionsApi, getSocialSummaryApi, updateProfileApi } from '@/api';
import {
  ListGroup,
  ListRow,
  ScreenContainer,
  ScreenHeader,
  Section,
  StatTile,
  Typography,
} from '@/components/ui';
import { useTabBarClearance } from '@/components/TabBar';
import { UserAvatar } from '@/components/UserAvatar';
import { COLORS, radius, spacing } from '@/theme';
import { computeStreak } from '@/utils/helpers/date/calendar';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/utils/constants/routes';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
  const tabBarClearance = useTabBarClearance();

  const {
    data: sessions,
    isLoading,
    refetch,
  } = ReactQuery.useQuery({ queryKey: ['sessions'], queryFn: getSessionsApi });
  const { data: socialSummary } = ReactQuery.useQuery({
    queryKey: ['social', 'summary'],
    queryFn: getSocialSummaryApi,
  });
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // По умолчанию выключено — isPublic на бэке по умолчанию true, поэтому
  // «только друзьям» считаем включённым лишь при явном isPublic === false.
  const friendsOnly = user?.isPublic === false;
  const updateProfileMutation = ReactQuery.useMutation({
    mutationFn: updateProfileApi,
    onSuccess: setUser,
  });
  const completed = (sessions ?? []).filter((s) => s.status === 'completed');
  const totalTonnage = completed.reduce(
    (sum, s) =>
      sum +
      s.exerciseLogs.reduce(
        (a, l) => a + (l.weight ?? 0) * (l.repsDone ?? 0),
        0,
      ),
    0,
  );
  const streak = computeStreak(
    completed
      .filter((s) => s.completedAt)
      .map((s) => new Date(s.completedAt as string)),
  );

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <ScreenHeader title="Профиль" />

      {/* TODO: 001, комментарии в файле компонента */}
      {/* Состояния вынести в отдельные компоненты, на каждое состояние должна быть своя вьюха (view) */}
      <React.Fragment>
        <Section>
          <View style={styles.identityCard}>
            <LinearGradient
              colors={['rgba(255,214,10,0.16)', 'rgba(255,214,10,0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <UserAvatar
              url={user?.avatarUrl ?? null}
              name={user?.name || user?.email || '?'}
              pro={user?.hasProAccess}
              size={92}
            />

            <Typography variant="display">
              {user?.name || 'Без имени'}
            </Typography>

            <Typography variant="body" color={COLORS.Text.secondary}>
              {user?.email}
            </Typography>
          </View>
        </Section>

        <Section title="Итоги">
          <View style={styles.statsRow}>
            <StatTile
              icon="fire"
              value={String(streak)}
              label="Серия, дней"
              tint={COLORS.Text.accent}
            />
            <StatTile
              icon="trophy-outline"
              value={String(completed.length)}
              label="Тренировок"
              tint={COLORS.Text.teal}
            />
            <StatTile
              icon="weight-lifter"
              value={`${Math.round(totalTonnage / 1000)}т`}
              label="Тоннаж"
              tint={COLORS.Text.positive}
            />
          </View>
        </Section>

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
              icon={user?.hasProAccess ? 'crown' : 'crown-outline'}
              tint={user?.hasProAccess ? COLORS.Text.accent : undefined}
              title="Тариф"
              subtitle={user?.hasProAccess ? 'ПРО' : 'Бесплатный'}
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
                  disabled={updateProfileMutation.isPending}
                  onValueChange={(value) =>
                    updateProfileMutation.mutate({ isPublic: !value })
                  }
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

        <Section>
          <ListGroup>
            <ListRow
              icon="logout"
              title="Выйти"
              destructive
              onPress={() => void signOut()}
              showChevron={false}
              isFirst
              isLast
            />
          </ListGroup>
        </Section>
      </React.Fragment>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  identityCard: {
    overflow: 'hidden',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.primary,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
});
