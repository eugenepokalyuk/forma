import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';
import Animated, { Easing, withTiming } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Typography } from '@/components/ui';
import { COLORS, motion, radius, spacing } from '@/theme';
import { formatMMSS } from '@/utils/helpers/string/number';
import { useSessionStore } from '@/store/session';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 240;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

// Полноэкранная пауза между подходами — единственное, что видно во время
// отдыха. Заканчивается вибрацией (звук — см. TODO ниже).
// TODO(звук): нет ассета assets/sounds/beep.wav в репозитории — добавить и
// проиграть через expo-audio, когда файл появится.
export function RestScreen({
  nextLabel,
  nextThumbnailUrl,
}: {
  nextLabel: string;
  nextThumbnailUrl?: string | null;
}) {
  const insets = SafeArea.useSafeAreaInsets();
  const restEndsAt = useSessionStore((s) => s.active?.restEndsAt ?? null);
  const totalRef = React.useRef<number>(0);
  const skipRest = useSessionStore((s) => s.skipRest);
  const extendRest = useSessionStore((s) => s.extendRest);
  const clearRest = useSessionStore((s) => s.clearRest);
  const [remaining, setRemaining] = React.useState(0);
  const firedRef = React.useRef(false);
  const progress = Reanimated.useSharedValue(0);

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
        clearRest();
      }
    };
    tick();
    const id = setInterval(tick, 500);

    return () => clearInterval(id);
  }, [restEndsAt, clearRest]);

  React.useEffect(() => {
    if (!restEndsAt) totalRef.current = 0;
  }, [restEndsAt]);

  const animatedProps = Reanimated.useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: motion.base }}
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Typography
        variant="label"
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
          <Typography
            variant="display"
            style={{ fontSize: 48, lineHeight: 56 }}
          >
            {formatMMSS(remaining)}
          </Typography>
        </View>
      </View>

      <View style={styles.nextRow}>
        <Typography variant="caption" color={COLORS.Text.tertiary}>
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
          <Typography
            variant="heading"
            align="center"
            style={{ flexShrink: 1 }}
          >
            {nextLabel}
          </Typography>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="+30 секунд"
          variant="secondary"
          onPress={() => extendRest(30)}
          style={{ flex: 1 }}
        />

        <Button title="Пропустить" onPress={skipRest} style={{ flex: 1 }} />
      </View>
    </MotiView>
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
  nextRow: { alignItems: 'center', gap: spacing.sm },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  nextThumb: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: COLORS.Surface.secondary,
  },
  actions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
});
