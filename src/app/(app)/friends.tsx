import * as ReactQuery from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  getFollowers,
  getFollowing,
  getFollowRequests,
  respondToFollowRequest,
  searchUsers,
} from '@/api/social';
import type { FollowRequestItem, PublicUser } from '@/api/types';
import { Button } from '@/components/Button';
import { FollowButton } from '@/components/FollowButton';
import { Input, ScreenContainer, Typography } from '@/components/ui';
import { UserRow } from '@/components/UserRow';
import { COLORS, spacing } from '@/theme';

type Tab = 'following' | 'followers' | 'requests';

const TABS: { key: Tab; label: string }[] = [
  { key: 'following', label: 'Подписки' },
  { key: 'followers', label: 'Подписчики' },
  { key: 'requests', label: 'Запросы' },
];

// Debounce вручную — поиск людей не должен слать запрос на каждый символ.
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default function FriendsScreen() {
  const [tab, setTab] = React.useState<Tab>('following');
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const isSearching = debouncedQuery.length >= 2;
  const queryClient = ReactQuery.useQueryClient();

  const { data: searchResults, isLoading: isSearchLoading } =
    ReactQuery.useQuery({
      queryKey: ['social', 'search', debouncedQuery],
      queryFn: () => searchUsers(debouncedQuery),
      enabled: isSearching,
    });

  const { data: following, isLoading: isFollowingLoading } =
    ReactQuery.useQuery({
      queryKey: ['social', 'following'],
      queryFn: getFollowing,
      enabled: !isSearching && tab === 'following',
    });

  const { data: followers, isLoading: isFollowersLoading } =
    ReactQuery.useQuery({
      queryKey: ['social', 'followers'],
      queryFn: getFollowers,
      enabled: !isSearching && tab === 'followers',
    });

  const { data: requests, isLoading: isRequestsLoading } = ReactQuery.useQuery({
    queryKey: ['social', 'requests'],
    queryFn: getFollowRequests,
    enabled: !isSearching && tab === 'requests',
  });

  const respondMutation = ReactQuery.useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      respondToFollowRequest(id, action),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['social'] }),
  });

  const tabData: PublicUser[] =
    tab === 'following'
      ? (following ?? [])
      : tab === 'followers'
        ? (followers ?? [])
        : [];
  const tabLoading =
    tab === 'following'
      ? isFollowingLoading
      : tab === 'followers'
        ? isFollowersLoading
        : isRequestsLoading;
  const emptyLabel =
    tab === 'following'
      ? 'Вы пока ни на кого не подписаны'
      : tab === 'followers'
        ? 'На вас пока никто не подписан'
        : 'Новых запросов нет';

  return (
    <ScreenContainer edges={[]} contentStyle={{ gap: spacing.md }}>
      <Stack.Screen options={{ title: 'Друзья' }} />

      <Input
        placeholder="Поиск по имени или ID"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {isSearching ? (
        <FlatList
          style={styles.list}
          data={searchResults ?? []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ gap: spacing.sm }}
          ListEmptyComponent={
            isSearchLoading ? null : (
              <Typography
                variant="body"
                color={COLORS.Text.secondary}
                align="center"
                style={styles.emptyText}
              >
                {'Никого не нашли'}
              </Typography>
            )
          }
          renderItem={({ item }) => (
            <UserRow user={item} trailing={<FollowButton user={item} />} />
          )}
        />
      ) : (
        <>
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={styles.tab}
                >
                  <Typography
                    variant="subtitle"
                    color={active ? COLORS.Text.primary : COLORS.Text.tertiary}
                  >
                    {t.label}
                  </Typography>

                  {active ? <View style={styles.tabUnderline} /> : null}
                </Pressable>
              );
            })}
          </View>

          {tab === 'requests' ? (
            <FlatList
              style={styles.list}
              data={requests ?? []}
              keyExtractor={(r) => r.id}
              contentContainerStyle={{ gap: spacing.sm }}
              ListEmptyComponent={
                tabLoading ? null : (
                  <Typography
                    variant="body"
                    color={COLORS.Text.secondary}
                    align="center"
                    style={styles.emptyText}
                  >
                    {emptyLabel}
                  </Typography>
                )
              }
              renderItem={({ item }: { item: FollowRequestItem }) => (
                <UserRow
                  user={item.follower}
                  trailing={
                    <View style={styles.requestActions}>
                      <Button
                        title="Принять"
                        style={styles.requestButton}
                        onPress={() =>
                          respondMutation.mutate({
                            id: item.id,
                            action: 'accept',
                          })
                        }
                      />

                      <Button
                        title="Отклонить"
                        variant="secondary"
                        style={styles.requestButton}
                        onPress={() =>
                          respondMutation.mutate({
                            id: item.id,
                            action: 'reject',
                          })
                        }
                      />
                    </View>
                  }
                />
              )}
            />
          ) : (
            <FlatList
              style={styles.list}
              data={tabData}
              keyExtractor={(u) => u.id}
              contentContainerStyle={{ gap: spacing.sm }}
              ListEmptyComponent={
                tabLoading ? null : (
                  <Typography
                    variant="body"
                    color={COLORS.Text.secondary}
                    align="center"
                    style={styles.emptyText}
                  >
                    {emptyLabel}
                  </Typography>
                )
              }
              renderItem={({ item }) => (
                <UserRow user={item} trailing={<FollowButton user={item} />} />
              )}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.Stroke.hairline,
  },
  tab: { paddingBottom: spacing.sm, alignItems: 'center', gap: spacing.xs },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.Text.accent,
    borderRadius: 1,
  },
  emptyText: { marginTop: spacing.xl },
  requestActions: { flexDirection: 'column', gap: spacing.xs },
  requestButton: { minWidth: 120 },
});
