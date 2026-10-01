import { router } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';

import {
  useAchievements,
  useBroPhrases,
  useUserStats,
  useWaterToday,
} from '@/queries/bro';
import { useSessions } from '@/queries/sessions';
import { Typography } from '@/components/ui';
import { COLORS, screenPadding, spacing } from '@/theme';
import {
  type BroMessage,
  type BroTodayContext,
  buildBroMessages,
  daysSinceLastWorkout,
  FALLBACK_PHRASES,
  findRecentAchievement,
  isRecordVolume,
} from '@/utils/helpers/bro/broMessages';
import { DEFAULT_TIMEZONE } from '@/utils/helpers/date/timeOfDay';
import { useTimeOfDay } from '@/utils/hooks/useTimeOfDay';
import { ROUTES } from '@/utils/constants/routes';
import { useAuthStore } from '@/store/auth';

const GAP = spacing.sm;

interface TipsCarouselProps {
  today: BroTodayContext;
  weeklyGoal: { primary: string; secondary: string } | null;
}

// Реплики Фитнес Бро — тот же набор источников и тот же порядок, что на
// сайте (см. src/utils/helpers/bro/broMessages.ts buildBroMessages): динамика (стрик/похвала/
// ачивка/цель недели) + подходящие сейчас условные фразы из админки + один
// случайный совет из общего пула. Раньше здесь рендерился весь пул советов
// разом (десятки карточек) — из-за этого количество не совпадало с сайтом,
// где Бро показывает по одной реплике за раз из этого же списка.
export function TipsCarousel({ today, weeklyGoal }: TipsCarouselProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width;
  const [index, setIndex] = React.useState(0);
  const user = useAuthStore((s) => s.user);

  const { data: phrases } = useBroPhrases();
  const { data: stats } = useUserStats();
  const { data: water } = useWaterToday();
  const { data: achievementsRes } = useAchievements();
  const { data: sessions } = useSessions();

  const timeOfDay = useTimeOfDay(user?.timezone ?? DEFAULT_TIMEZONE);

  // Стабильные на монтирование: выбор совета из пула и решение о промо-ПРО.
  const [speechSeed] = React.useState(() => Math.random());
  const [showPro] = React.useState(() => Math.random() < 0.25);

  const history = React.useMemo(() => sessions ?? [], [sessions]);
  const daysSincePause = React.useMemo(
    () => daysSinceLastWorkout(history),
    [history],
  );

  const isVolumeRecord = React.useMemo(() => {
    if (!today.isToday || !today.isCompleted) return false;
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    return isRecordVolume(history, today.completedVolumeKg ?? 0, startOfToday);
  }, [history, today]);

  const recentAchievement = React.useMemo(
    () => (achievementsRes ? findRecentAchievement(achievementsRes) : null),
    [achievementsRes],
  );

  const messages = React.useMemo(
    () =>
      buildBroMessages({
        phrases: phrases ?? FALLBACK_PHRASES,
        stats: stats ?? null,
        user: user ?? null,
        water: water ?? null,
        timeOfDay,
        today,
        recentAchievement,
        daysSincePause,
        isVolumeRecord,
        weeklyGoal,
        showPro,
        speechSeed,
        onNavigatePrograms: () => router.push(ROUTES.catalog),
        onShowProInfo: () =>
          Alert.alert(
            'ПРО доступен на сайте',
            'Оформить подписку можно на forma-one.ru',
          ),
      }),
    [
      phrases,
      stats,
      user,
      water,
      timeOfDay,
      today,
      recentAchievement,
      daysSincePause,
      isVolumeRecord,
      weeklyGoal,
      showPro,
      speechSeed,
    ],
  );

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  if (!messages.length) return null;

  return (
    <View style={styles.bleed}>
      <Typography
        variant="title"
        color={COLORS.Text.accent}
        align="center"
        style={styles.header}
      >
        {'ФИТНЕС БРО'}
      </Typography>

      <FlatList
        data={messages}
        keyExtractor={(item: BroMessage) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }: { item: BroMessage }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            <Typography variant="body" align="center">
              {item.text}
            </Typography>

            {item.cta ? (
              <Pressable
                onPress={item.cta.onPress}
                hitSlop={8}
                style={styles.cta}
              >
                <Typography variant="body" color={COLORS.Text.accent}>
                  {item.cta.label}
                </Typography>
              </Pressable>
            ) : null}
          </View>
        )}
      />
      <View style={styles.dots}>
        {messages.map((m, i) => (
          <View
            key={m.id}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -screenPadding, paddingVertical: spacing.md },
  header: { marginBottom: spacing.sm, paddingHorizontal: screenPadding },
  card: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  cta: { marginTop: spacing.sm, alignSelf: 'center' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.Surface.secondary,
  },
  dotActive: { backgroundColor: COLORS.Surface.accent, width: 8 },
});
