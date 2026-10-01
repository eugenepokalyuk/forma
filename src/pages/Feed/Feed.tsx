import * as ReactQuery from '@tanstack/react-query';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { getFeedApi, likePostApi, unlikePostApi } from '@/api';
import type { Post } from '@/api';
import { Button } from '@/components/Button';
import { CommentsModal } from '@/pages/Feed/components/CommentsModal';
import { PostCard } from '@/pages/Feed/components/PostCard';
import { FadeInItem } from '@/components/FadeInItem';
import { ScreenContainer, ScreenHeader, Typography } from '@/components/ui';
import { useTabBarClearance } from '@/components/TabBar';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/utils/constants/routes';

export default function FeedScreen() {
  const queryClient = ReactQuery.useQueryClient();
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
  } = ReactQuery.useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => getFeedApi(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length > 0 ? lastPage[lastPage.length - 1].createdAt : undefined,
  });

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

  const toggleLike = ReactQuery.useMutation({
    mutationFn: (post: Post) =>
      post.isLiked ? unlikePostApi(post.id) : likePostApi(post.id),
    onMutate: (post) => {
      queryClient.setQueryData<typeof data>(['feed'], (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) =>
            page.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    isLiked: !p.isLiked,
                    likesCount: p.likesCount + (p.isLiked ? -1 : 1),
                  }
                : p,
            ),
          ),
        };
      });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

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
