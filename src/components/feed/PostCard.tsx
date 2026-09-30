import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';

import type { Post } from '@/api/types';
import { CustomIcon, Icon, Typography } from '@/components/ui';
import { UserAvatar } from '@/components/UserAvatar';
import { formatMMSS } from '@/utils/format';
import { formatRelativeTime } from '@/utils/relativeTime';
import { COLORS, motion, radius, shadow, spacing } from '@/theme';

const DOUBLE_TAP_MS = 280;
type Slide = 'photo' | 'workout';

interface PostCardProps {
  post: Post;
  onToggleLike: () => void;
  onOpenComments: () => void;
}

// TODO: Почему компоненты feed экрана здесь лежат?
export function PostCard({
  post,
  onToggleLike,
  onOpenComments,
}: PostCardProps) {
  const lastTapRef = React.useRef(0);
  const [showBurst, setShowBurst] = React.useState(false);
  const photo = post.photoUrl ?? post.photos[0];
  const hasWorkoutSlide = post.exercises.length > 0;
  const slides: Slide[] = photo
    ? hasWorkoutSlide
      ? ['photo', 'workout']
      : ['photo']
    : hasWorkoutSlide
      ? ['workout']
      : [];

  // Сердце-вспышка на даблтап — само скрывается через секунду. Без этого
  // условие показа никогда не возвращалось к «false», и сердце оставалось
  // на фото навсегда, а каждый новый даблтап копил ещё одну анимацию.
  React.useEffect(() => {
    if (!showBurst) return;

    const id = setTimeout(() => setShowBurst(false), 900);

    return () => clearTimeout(id);
  }, [showBurst]);

  const onPhotoPress = () => {
    const now = Date.now();

    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      if (!post.isLiked) onToggleLike();

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setShowBurst(true);
    }
    lastTapRef.current = now;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <UserAvatar
          url={post.author.avatarUrl}
          name={post.author.name}
          pro={post.author.hasProAccess}
          size={44}
        />

        <View style={{ flex: 1 }}>
          <Typography variant="subtitle">{post.author.name}</Typography>

          <Typography variant="body" color={COLORS.Text.tertiary}>
            {formatRelativeTime(post.createdAt)}
          </Typography>
        </View>
      </View>

      {slides.length > 0 ? (
        <MediaPager
          slides={slides}
          photo={photo}
          post={post}
          showBurst={showBurst}
          onPhotoPress={onPhotoPress}
        />
      ) : null}

      <Typography variant="body" style={styles.title}>
        {post.title}
      </Typography>

      <View style={styles.actionsBox}>
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={onToggleLike}>
            <MotiView
              key={post.isLiked ? 'liked' : 'unliked'}
              from={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={motion.springy}
            >
              <Icon
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={32}
                color={
                  post.isLiked ? COLORS.Text.negative : COLORS.Icon.primary
                }
              />
            </MotiView>

            <Typography variant="title" color={COLORS.Text.secondary}>
              {post.likesCount}
            </Typography>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={onOpenComments}>
            <CustomIcon name="cards" size={32} color={COLORS.Icon.primary} />

            <Typography variant="title" color={COLORS.Text.secondary}>
              {post.commentsCount}
            </Typography>
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <PostStatsRow post={post} />
        </View>
      </View>
    </View>
  );
}

// Медиа-пейджер поста: фото и итог пройденной тренировки — два слайда одной
// карточки, а не фото + список под ним. Если чего-то одного нет — пейджер
// не нужен, показываем единственный слайд без точек и свайпа.
function MediaPager({
  slides,
  photo,
  post,
  showBurst,
  onPhotoPress,
}: {
  slides: Slide[];
  photo: string | undefined;
  post: Post;
  showBurst: boolean;
  onPhotoPress: () => void;
}) {
  const [width, setWidth] = React.useState(0);
  const [page, setPage] = React.useState(0);

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setPage(first.index);
    },
  ).current;

  const renderSlide = (slide: Slide) =>
    slide === 'photo' ? (
      <PhotoSlide
        width={width}
        photo={photo as string}
        showBurst={showBurst}
        onPress={onPhotoPress}
      />
    ) : (
      <WorkoutSlide width={width} post={post} />
    );

  if (slides.length === 1) {
    return (
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? renderSlide(slides[0]) : null}
      </View>
    );
  }

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <FlatList
          data={slides}
          keyExtractor={(item) => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item }) => renderSlide(item)}
        />
      ) : null}
      <View style={styles.pagerDots}>
        {slides.map((slide, i) => (
          <View
            key={slide}
            style={[styles.pagerDot, i === page && styles.pagerDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

function PhotoSlide({
  width,
  photo,
  showBurst,
  onPress,
}: {
  width: number;
  photo: string;
  showBurst: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.photoWrap, { width }]}>
        <Image
          source={{ uri: photo }}
          style={styles.photo}
          contentFit="cover"
        />

        <AnimatePresence>
          {showBurst ? (
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={motion.springy}
              style={styles.heartBurst}
              pointerEvents="none"
            >
              <Icon name="heart" size={72} color={COLORS.White} />
            </MotiView>
          ) : null}
        </AnimatePresence>
      </View>
    </Pressable>
  );
}

function WorkoutSlide({ width, post }: { width: number; post: Post }) {
  return (
    // Высота задаётся числом (height: width), а не только aspectRatio —
    // вложенному FlatList с flex:1 нужен реально зафиксированный размер
    // родителя, иначе список не скроллится сам, а растягивает слайд и
    // наезжает на контент под пейджером.
    <View style={[styles.workoutSlide, { width, height: width }]}>
      <FlatList
        data={post.exercises}
        keyExtractor={(_, i) => String(i)}
        style={styles.workoutList}
        contentContainerStyle={{ gap: spacing.sm }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: ex }) => (
          <View style={styles.exerciseChip}>
            {ex.thumbnailUrl ? (
              <Image
                source={{ uri: ex.thumbnailUrl }}
                style={styles.exerciseThumb}
              />
            ) : null}
            <View style={{ flex: 1 }}>
              <Typography variant="subtitle" numberOfLines={1}>
                {ex.name}
              </Typography>

              <Typography
                variant="body"
                color={COLORS.Text.tertiary}
                numberOfLines={1}
              >
                {ex.sets.join(' · ')}
              </Typography>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// Время и тоннаж — характеристики всего поста, а не конкретного слайда:
// показываем их постоянно под пейджером, а не прячем на слайде тренировки.
function PostStatsRow({ post }: { post: Post }) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statChip}>
        <Icon name="clock-outline" size={24} color={COLORS.Text.secondary} />

        <Typography variant="body" color={COLORS.Text.secondary}>
          {formatMMSS(post.durationSeconds)}
        </Typography>
      </View>

      <View style={styles.statChip}>
        <Icon name="weight-lifter" size={24} color={COLORS.Text.secondary} />

        <Typography variant="body" color={COLORS.Text.secondary}>
          {Math.round(Number(post.volumeKg))} кг
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    overflow: 'hidden',
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  photoWrap: { aspectRatio: 1, backgroundColor: COLORS.Surface.secondary },
  photo: { width: '100%', height: '100%' },
  heartBurst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  pagerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.Surface.secondary,
  },
  pagerDotActive: { backgroundColor: COLORS.Surface.accent, width: 14 },
  workoutSlide: {
    aspectRatio: 1,
    backgroundColor: COLORS.Surface.secondary,
    padding: spacing.md,
  },
  workoutList: { flex: 1 },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  exerciseThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.xs,
    backgroundColor: COLORS.Surface.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  actionsBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
