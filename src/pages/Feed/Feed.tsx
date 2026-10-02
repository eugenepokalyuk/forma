import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import {
  Button,
  ErrorState,
  FadeInItem,
  ScreenContainer,
  ScreenHeader,
  Typography,
  useTabBarClearance,
  useUnderStatusBarScroll,
} from '@/shared/ui';
import { CommentsModal } from '@/pages/Feed/components/CommentsModal';
import { PostCard } from '@/pages/Feed/components/PostCard';
import { ReportSheet } from '@/pages/Feed/components/ReportSheet';
import { useContentActions } from '@/pages/Feed/hooks/useContentActions';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useFeed, useToggleLike } from '@/modules/social';
import { AppHeader } from '@/modules/auth/components/AppHeader';

export default function FeedScreen() {
  const tabBarClearance = useTabBarClearance();
  const statusBarScroll = useUnderStatusBarScroll();
  const actions = useContentActions();
  const [openCommentsFor, setOpenCommentsFor] = React.useState<string | null>(
    null,
  );

  const {
    data,
    isLoading,
    isError,
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
        {...statusBarScroll.scrollProps}
        progressViewOffset={statusBarScroll.refreshOffset}
        style={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={[
          {
            gap: spacing.md,
            paddingTop: statusBarScroll.paddingTop,
            paddingBottom: tabBarClearance,
          },
          posts.length === 0 && styles.emptyContent,
        ]}
        // gap списка действует и между шапкой и первым постом — убираем его,
        // под шапкой остаётся только её собственный нижний отступ.
        ListHeaderComponent={<AppHeader />}
        ListHeaderComponentStyle={{ marginBottom: -spacing.md }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        ListEmptyComponent={
          isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
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
          )
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
              onMore={
                actions.isMine(item.author)
                  ? () => actions.openMyPostActions(item.id)
                  : () =>
                      actions.openActions(
                        { kind: 'post', postId: item.id },
                        item.author,
                      )
              }
            />
          </FadeInItem>
        )}
      />

      <CommentsModal
        postId={openCommentsFor}
        onClose={() => setOpenCommentsFor(null)}
      />

      <ReportSheet {...actions.reportSheet} />
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
