import { FlatList, StyleSheet, View } from 'react-native';

import { useFollowRequests, useRespondToFollowRequest } from '@/modules/social';
import { UserRow } from '@/modules/social/ui';
import { Button, ListEmpty } from '@/shared/ui';
import { spacing } from '@/theme';

// Входящие запросы на подписку: принять или отклонить.
export function RequestsListView() {
  const requests = useFollowRequests(true);
  const respond = useRespondToFollowRequest();

  return (
    <FlatList
      style={styles.list}
      data={requests.data ?? []}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <ListEmpty
          isError={requests.isError}
          isLoading={requests.isLoading}
          onRetry={requests.refetch}
          message="Новых запросов нет"
        />
      }
      renderItem={({ item }) => (
        <UserRow
          user={item.follower}
          trailing={
            <View style={styles.actions}>
              <Button
                title="Принять"
                style={styles.button}
                onPress={() =>
                  respond.mutate({ id: item.id, action: 'accept' })
                }
              />

              <Button
                title="Отклонить"
                variant="secondary"
                style={styles.button}
                onPress={() =>
                  respond.mutate({ id: item.id, action: 'reject' })
                }
              />
            </View>
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: spacing.sm },
  actions: { flexDirection: 'column', gap: spacing.xs },
  button: { minWidth: 120 },
});
