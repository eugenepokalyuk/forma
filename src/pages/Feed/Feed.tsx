import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  ListEmpty,
  ScreenContainer,
  useTabBarClearance,
  useUnderStatusBarScroll,
} from '@/shared/ui';
import { CommentsModal } from '@/pages/Feed/components/CommentsModal';
import { PostCard } from '@/pages/Feed/components/PostCard';
import { PostPage } from '@/pages/Feed/components/PostPage';
import { ReportSheet } from '@/pages/Feed/components/ReportSheet';
import { useContentActions } from '@/pages/Feed/hooks/useContentActions';
import { COLORS, screenPadding, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useFeed, useToggleLike, type Post } from '@/modules/social';
import { AppHeader } from '@/modules/auth/components/AppHeader';
import { useRefresh } from '@/shared/lib/hooks/useRefresh';

// Сколько выглядывают соседние посты сверху и снизу и зазор между ними.
const PEEK = 24;
const GAP = spacing.sm;

const selectionHaptic = () => void Haptics.selectionAsync();

// Лента — вертикальная карусель: пост на страницу, листается со снэпом,
// соседние выглядывают по краям.
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

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Лёгкий щелчок, когда в центр встаёт следующий пост.
  useAnimatedReaction(
    () => (interval > 0 ? Math.round(scrollY.get() / interval) : 0),
    (page, prev) => {
      if (prev !== null && page !== prev && page >= 0) {
        scheduleOnRN(selectionHaptic);
      }
    },
    [interval],
  );

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <PostPage
      index={index}
      interval={interval}
      height={pageHeight}
      scrollY={scrollY}
    >
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
    </PostPage>
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
          <Animated.FlatList
            style={styles.list}
            data={posts}
            keyExtractor={(item) => item.id}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            snapToInterval={interval}
            decelerationRate="fast"
            disableIntervalMomentum
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: PEEK + interval * index,
              index,
            })}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            contentContainerStyle={[
              {
                gap: GAP,
                paddingTop: PEEK,
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
