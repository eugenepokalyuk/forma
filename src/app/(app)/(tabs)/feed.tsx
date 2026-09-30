import * as ReactQuery from '@tanstack/react-query';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { fetchFeed, likePost, unlikePost } from '@/api/social';
import type { Post } from '@/api/types';
import { Button } from '@/components/Button';
import { CommentsModal } from '@/components/feed/CommentsModal';
import { PostCard } from '@/components/feed/PostCard';
import { FadeInItem } from '@/components/FadeInItem';
import { ScreenContainer, ScreenHeader, Typography } from '@/components/ui';
import { useTabBarClearance } from '@/components/TabBar';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/utils/routes';

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
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
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
      post.isLiked ? unlikePost(post.id) : likePost(post.id),
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
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <ScreenHeader title="Лента" />

      {/* TODO: 003, комментарии в файле компонента */}
      {/* Состояния вынести в отдельные компоненты, на каждое состояние должна быть своя вьюха (view) */}
      {posts.length === 0 ? (
        //   Empty state - подобное сосотяние повторяется уже N раз в разных компоненах, мб задуматься о том , чтобы создать собсвтенный компонент
        <View style={[styles.empty, { paddingBottom: tabBarClearance }]}>
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
      ) : (
        //   Not empty state
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: spacing.md,
            paddingBottom: tabBarClearance,
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
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
      )}

      <CommentsModal
        postId={openCommentsFor}
        onClose={() => setOpenCommentsFor(null)}
      />
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
});
