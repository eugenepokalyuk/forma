import { Stack } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { useBlockedUsers, useUnblockUser } from '@/modules/social';
import { UserRow } from '@/modules/social/ui';
import { Button, ErrorState, ScreenContainer, Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

// Заблокированные пользователи — отсюда их можно разблокировать.
export default function BlockedScreen() {
  const { data, isLoading, isError, refetch } = useBlockedUsers();
  const unblock = useUnblockUser();

  return (
    <ScreenContainer edges={[]} loading={isLoading}>
      <Stack.Screen options={{ title: 'Заблокированные' }} />

      <FlatList
        style={styles.list}
        data={data ?? []}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md }}
        ListEmptyComponent={
          isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <Typography
              variant="body"
              color={COLORS.Text.secondary}
              align="center"
              style={styles.empty}
            >
              {'Вы никого не блокировали'}
            </Typography>
          )
        }
        renderItem={({ item }) => (
          <UserRow
            user={item}
            trailing={
              <Button
                title="Разблокировать"
                variant="secondary"
                loading={unblock.isPending && unblock.variables === item.id}
                onPress={() => unblock.mutate(item.id)}
              />
            }
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  empty: { paddingVertical: spacing.xl },
});
