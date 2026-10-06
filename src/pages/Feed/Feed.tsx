import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import {
  ListEmpty,
  ScreenContainer,
  useTabBarClearance,
  useUnderStatusBarScroll,
} from '@/shared/ui';
import { CommentsModal } from '@/pages/Feed/components/CommentsModal';
import { PostCard } from '@/pages/Feed/components/PostCard';
import { ReportSheet } from '@/pages/Feed/components/ReportSheet';
import { useContentActions } from '@/pages/Feed/hooks/useContentActions';
import { COLORS, screenPadding, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useFeed, useToggleLike, type Post } from '@/modules/social';
import { AppHeader } from '@/modules/auth/components/AppHeader';
import { useRefresh } from '@/shared/lib/hooks/useRefresh';

// Сколько выглядывает следующий пост снизу и зазор между постами.
const PEEK = 24;
const GAP = spacing.sm;

// Лента — вертикальный список постов высотой почти в экран (следующий
// выглядывает снизу), прокрутка свободная, без снэпа.
export default function FeedScreen() {
  const tabBarClearance = useTabBarClearance();
  const statusBarScroll = useUnderStatusBarScroll();
  const actions = useContentActions();
  const [openCommentsFor, setOpenCommentsFor] = React.useState<string | null>(
    null,
  );
  const [listHeight, setListHeight] = React.useState(0);

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

  const { isRefreshing, onRefresh } = useRefresh(refetch);

  const toggleLike = useToggleLike();

  // Видимая часть списка — без таб-бара, который плавает поверх.
  const visible = Math.max(listHeight - tabBarClearance, 0);
  const pageHeight = Math.max(visible - PEEK * 2, 0);
  const interval = pageHeight + GAP;

  const renderPost = ({ item }: { item: Post }) => (
    <View style={{ height: pageHeight }}>
      <PostCard
        post={item}
        style={styles.card}
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
    </View>
  );

  return (
    <ScreenContainer edges={['top']} loading={isLoading}>
      <View style={{ paddingTop: statusBarScroll.paddingTop }}>
        <AppHeader />
      </View>

      <View
        style={styles.list}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
      >
        {pageHeight > 0 ? (
          <FlatList
            style={styles.list}
            data={posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: GAP + interval * index,
              index,
            })}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            contentContainerStyle={[
              {
                gap: GAP,
                paddingTop: GAP,
                paddingBottom: tabBarClearance + PEEK,
                paddingHorizontal: screenPadding,
              },
              posts.length === 0 && styles.emptyContent,
            ]}
            onEndReachedThreshold={1}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            ListEmptyComponent={
              <ListEmpty
                isError={isError}
                onRetry={refetch}
                title="Пока тихо"
                message="В ленте пока пусто. Подпишитесь на друзей, чтобы видеть их тренировки"
                action={{
                  title: 'Найти друзей',
                  onPress: () => router.push(ROUTES.friends),
                }}
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator color={COLORS.Icon.accent} />
              ) : null
            }
            renderItem={renderPost}
          />
        ) : null}
      </View>

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
  card: { flex: 1 },
  emptyContent: { flexGrow: 1 },
});
