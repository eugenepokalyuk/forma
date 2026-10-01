import * as React from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';

import { PALETTE } from '@/theme';

// Фоновая «аврора»: несколько мягких цветовых пятен медленно плывут и дышат.
// Должна быть почти незаметной — оживляет блок, не отвлекая от текста.
// Анимируются только transform на UI-потоке; при «Уменьшении движения»
// в настройках системы пятна стоят на месте.

interface Blob {
  color: string;
  size: number;
  left: DimensionValue;
  top: DimensionValue;
  // Амплитуда дрейфа (pt) и период полного цикла (мс) — у каждого свой,
  // поэтому вместе они не складываются в заметный повторяющийся рисунок.
  driftX: number;
  driftY: number;
  period: number;
}

const BLOBS: Blob[] = [
  {
    color: '#b229b9',
    size: 300,
    left: '-15%',
    top: '5%',
    driftX: 40,
    driftY: 24,
    period: 14_000,
  },
  {
    color: '#5c27b2',
    size: 260,
    left: '45%',
    top: '20%',
    driftX: -36,
    driftY: 30,
    period: 17_000,
  },
  {
    color: '#0b2174',
    size: 220,
    left: '15%',
    top: '45%',
    driftX: 30,
    driftY: -22,
    period: 11_000,
  },
];

interface AuroraBackgroundProps {
  // Прозрачность центра пятен: 0.1–0.3 — фон, а не акцент.
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

export function AuroraBackground({
  intensity = 0.2,
  style,
}: AuroraBackgroundProps) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
    >
      {BLOBS.map((blob, i) => (
        <AuroraBlob
          key={i}
          id={`aurora-${i}`}
          blob={blob}
          opacity={intensity}
        />
      ))}
    </View>
  );
}

function AuroraBlob({
  id,
  blob,
  opacity,
}: {
  id: string;
  blob: Blob;
  opacity: number;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    // Туда и обратно по синусоиде — без рывков в точках разворота.
    t.set(
      withRepeat(
        withTiming(1, {
          duration: blob.period / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, [blob.period, reduceMotion, t]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = t.get();
    return {
      transform: [
        { translateX: blob.driftX * p },
        { translateY: blob.driftY * p },
        { scale: 1 + 0.12 * p },
      ],
    };
  });

  const r = blob.size / 2;

  return (
    <Animated.View
      style={[
        styles.blob,
        { width: blob.size, height: blob.size, left: blob.left, top: blob.top },
        animatedStyle,
      ]}
    >
      <Svg width={blob.size} height={blob.size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={blob.color} stopOpacity={opacity} />
            <Stop
              offset="0.55"
              stopColor={blob.color}
              stopOpacity={opacity * 0.35}
            />
            <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  blob: { position: 'absolute' },
});
