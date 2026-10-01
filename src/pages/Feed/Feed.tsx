import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import {
  Button,
  FadeInItem,
  ScreenContainer,
  ScreenHeader,
  Typography,
  useTabBarClearance,
} from '@/shared/ui';
import { CommentsModal } from '@/pages/Feed/components/CommentsModal';
import { PostCard } from '@/pages/Feed/components/PostCard';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useFeed, useToggleLike } from '@/modules/social';

export default function FeedScreen() {
  const tabBarClearance = useTabBarClearance();
  const [openCommentsFor, setOpenCommentsFor] = React.useState<string | null>(
    null,
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useFeed();

  const posts = data?.pages.flat() ?? [];

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const toggleLike = useToggleLike();

  return (
    <ScreenContainer edges={['top']} loading={isLoading}>
      <FlatList
        style={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={[
          { gap: spacing.md, paddingBottom: tabBarClearance },
          posts.length === 0 && styles.emptyContent,
        ]}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        ListHeaderComponent={<ScreenHeader title="Лента" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Typography variant="display" align="center">
              {'Пока тихо'}
            </Typography>

            <Typography
              variant="body"
              color={COLORS.Text.secondary}
              align="center"
              style={{ marginTop: spacing.xs }}
            >
              {
                'В ленте пока пусто. Подпишитесь на друзей, чтобы видеть их тренировки'
              }
            </Typography>

            <Button
              title="Найти друзей"
              onPress={() => router.push(ROUTES.friends)}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={COLORS.Icon.accent}
              style={{ marginTop: spacing.md }}
            />
          ) : null
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={index}>
            <PostCard
              post={item}
              onToggleLike={() => toggleLike.mutate(item)}
              onOpenComments={() => setOpenCommentsFor(item.id)}
            />
          </FadeInItem>
        )}
      />

      <CommentsModal
        postId={openCommentsFor}
        onClose={() => setOpenCommentsFor(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  emptyContent: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
