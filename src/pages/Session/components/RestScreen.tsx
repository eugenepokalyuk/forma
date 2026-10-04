import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';
import Animated, { Easing, withTiming } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { Button, FadeInCover, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatMMSS } from '@/shared/lib/string/number';
import { useSessionStore } from '@/modules/workout';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 240;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

// Конец отдыха, «проспанный» с закрытым приложением, при возврате не озвучиваем.
const SOUND_LATE_MS = 2_000;

// Полноэкранная пауза между подходами — единственное, что видно во время
// отдыха. Заканчивается вибрацией и звуковым сигналом (его играет родитель:
// этот экран размонтируется сразу после конца отдыха и оборвал бы звук).
export function RestScreen({
  nextTitle,
  nextSets,
  nextThumbnailUrl,
  onDone,
}: {
  // Что дальше: упражнение (или «Итог тренировки») и, если это ещё один
  // подход того же упражнения, — «Подход 2 из 4» отдельной строкой.
  nextTitle: string;
  nextSets?: string;
  nextThumbnailUrl?: string | null;
  // Отдых закончился сам (sound — пора подать сигнал) или по «Пропустить».
  onDone: (options?: { sound?: boolean }) => void;
}) {
  const insets = SafeArea.useSafeAreaInsets();
  const restEndsAt = useSessionStore((s) => s.active?.restEndsAt ?? null);
  const totalRef = React.useRef<number>(0);
  const extendRest = useSessionStore((s) => s.extendRest);
  const [remaining, setRemaining] = React.useState(0);
  const firedRef = React.useRef(false);
  const progress = Reanimated.useSharedValue(0);
  // Интервал таймера живёт весь отдых — колбэк берём из ref, чтобы не
  // перезапускать его на каждый рендер родителя.
  const onDoneRef = React.useRef(onDone);
  React.useEffect(() => {
    onDoneRef.current = onDone;
  });

  React.useEffect(() => {
    if (!restEndsAt) return;
    firedRef.current = false;
    const total = Math.max(
      1,
      Math.round((new Date(restEndsAt).getTime() - Date.now()) / 1000),
    );
    totalRef.current = Math.max(totalRef.current, total);

    const tick = () => {
      const left = Math.max(
        0,
        Math.round((new Date(restEndsAt).getTime() - Date.now()) / 1000),
      );
      setRemaining(left);
      progress.value = withTiming(
        1 - left / Math.max(totalRef.current, left, 1),
        {
          duration: 400,
          easing: Easing.linear,
        },
      );
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        onDoneRef.current({
          sound: Date.now() - new Date(restEndsAt).getTime() < SOUND_LATE_MS,
        });
      }
    };
    tick();
    const id = setInterval(tick, 500);

    return () => clearInterval(id);
  }, [restEndsAt, progress]);

  React.useEffect(() => {
    if (!restEndsAt) totalRef.current = 0;
  }, [restEndsAt]);

  const animatedProps = Reanimated.useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Typography
        variant="subtitle"
        color={COLORS.Text.secondary}
        style={{ marginTop: spacing.lg }}
      >
        {'ОТДЫХ'}
      </Typography>

      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={COLORS.Surface.secondary}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={COLORS.Surface.accent}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            rotation="-90"
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>

        <View style={styles.timeOverlay}>
          <Typography variant="hero">{formatMMSS(remaining)}</Typography>
        </View>
      </View>

      <View style={styles.nextRow}>
        <Typography variant="subtitle" color={COLORS.Text.tertiary}>
          {'ДАЛЬШЕ'}
        </Typography>

        <View style={styles.nextCard}>
          {nextThumbnailUrl ? (
            <Image
              source={{ uri: nextThumbnailUrl }}
              style={styles.nextThumb}
              contentFit="cover"
            />
          ) : null}

          <View style={styles.nextText}>
            <Typography variant="subtitle">{nextTitle}</Typography>

            {nextSets ? (
              <Typography variant="body" color={COLORS.Text.secondary}>
                {nextSets}
              </Typography>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="+30 секунд"
          variant="secondary"
          onPress={() => extendRest(30)}
          style={{ flex: 1 }}
        />

        <Button
          title="Пропустить"
          onPress={() => onDone()}
          style={{ flex: 1 }}
        />
      </View>

      <FadeInCover />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  timeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: '100%',
  },
  nextText: {
    flexShrink: 1,
    gap: 2,
  },
  nextThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: COLORS.Surface.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
});
