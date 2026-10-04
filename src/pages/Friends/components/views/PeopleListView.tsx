import { FlatList, StyleSheet } from 'react-native';

import { useFollowers, useFollowing, useSearchUsers } from '@/modules/social';
import { UserRow } from '@/modules/social/ui';
import { FollowButton } from '@/pages/Friends/components/FollowButton';
import { ListEmpty } from '@/shared/ui';
import { spacing } from '@/theme';

type PeopleSource =
  | { kind: 'search'; query: string }
  | { kind: 'following' }
  | { kind: 'followers' };

const EMPTY_LABEL = {
  search: 'Никого не нашли',
  following: 'Вы пока ни на кого не подписаны',
  followers: 'На вас пока никто не подписан',
} as const;

// Список людей с кнопкой подписки: результаты поиска, подписки или
// подписчики. Сам грузит нужный список; остальные запросы выключены.
export function PeopleListView({ source }: { source: PeopleSource }) {
  const search = useSearchUsers(
    source.kind === 'search' ? source.query : '',
    source.kind === 'search',
  );
  const following = useFollowing(source.kind === 'following');
  const followers = useFollowers(source.kind === 'followers');
  const query =
    source.kind === 'search'
      ? search
      : source.kind === 'following'
        ? following
        : followers;

  return (
    <FlatList
      style={styles.list}
      data={query.data ?? []}
      keyExtractor={(u) => u.id}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <ListEmpty
          isError={query.isError}
          isLoading={query.isLoading}
          onRetry={query.refetch}
          message={EMPTY_LABEL[source.kind]}
        />
      }
      renderItem={({ item }) => (
        <UserRow user={item} trailing={<FollowButton user={item} />} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { gap: spacing.sm },
});
