import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as SafeArea from 'react-native-safe-area-context';

import { COLORS, motion } from '@/theme';

import { useOutboxStore } from '../sync/outbox';
import { useSyncProgress } from '../sync/syncProgress';

// Короткая отправка (один подход — доли секунды) полоску не показывает,
// иначе она мигала бы на каждом подходе.
const SHOW_DELAY = 400;
// Пока операция в пути, полоска ползёт к следующей отметке, но не доходит
// до неё — дойдёт, когда операция уйдёт.
const CREEP = 0.7;
const CREEP_MS = 4000;
const HEIGHT = 2;

// Тонкая полоска под статус-баром, пока очередь синхронизации отправляет
// данные на сервер. Лежит поверх всех экранов, нажатия не перехватывает.
export function SyncProgressBar() {
  const insets = SafeArea.useSafeAreaInsets();
  const active = useSyncProgress((s) => s.active);
  const sent = useSyncProgress((s) => s.sent);
  const total = useSyncProgress((s) => s.total);
  const pending = useOutboxStore((s) => s.ops.length);

  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (active) {
      opacity.set(
        withDelay(SHOW_DELAY, withTiming(1, { duration: motion.fast })),
      );
      const done = total > 0 ? sent / total : 0;
      const next = total > 0 ? (sent + CREEP) / total : CREEP;
      progress.set(
        withSequence(
          withTiming(done, { duration: motion.base }),
          withTiming(next, {
            duration: CREEP_MS,
            easing: Easing.out(Easing.quad),
          }),
        ),
      );
      return;
    }
    // Всё ушло — дотягиваем до конца и гасим; отправка прервалась (нет сети)
    // — просто гасим: о неотправленном говорит тост на главной.
    if (pending === 0) progress.set(withTiming(1, { duration: motion.base }));
    opacity.set(
      withDelay(
        pending === 0 ? motion.base : 0,
        withTiming(0, { duration: motion.base }, (finished) => {
          if (finished) progress.set(0);
        }),
      ),
    );
  }, [active, sent, total, pending, progress, opacity]);

  const trackStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.get() * 100}%`,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.track, { top: insets.top }, trackStyle]}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HEIGHT,
  },
  fill: {
    height: HEIGHT,
    borderRadius: HEIGHT,
    backgroundColor: COLORS.Surface.accent,
  },
});
