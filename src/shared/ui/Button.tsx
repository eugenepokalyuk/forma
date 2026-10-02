import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Easing,
  interpolateColor,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { GlassView } from './glass';
import { Typography } from './Typography';
import { COLORS, gradients, hitTarget, motion, radius, spacing } from '@/theme';

// Оттенок стекла по варианту: основная — фирменный жёлтый, второстепенная —
// нейтральное стекло, опасная — красный.
const GLASS_TINT: Record<
  NonNullable<ButtonProps['variant']>,
  string | undefined
> = {
  primary: COLORS.Surface.accent,
  secondary: undefined,
  danger: COLORS.Text.negative,
};

// Неактивная ↔ активная. Нативное стекло меняет tintColor мгновенно, поэтому
// оттенок и цвет подписи ведём сами — покадрово, только пока идёт переход.
const STATE_TIMING = { duration: motion.base, easing: Easing.out(Easing.quad) };

// Цвета стеклянной кнопки на долю перехода p: 0 — неактивная, 1 — активная.
// Оттенок проявляется из того же цвета с нулевой альфой (#RRGGBB00), а не из
// прозрачного чёрного — иначе на середине перехода кнопка темнеет. В крайнем
// неактивном положении — undefined: стекло без оттенка, как и раньше.
function glassColorsAt(p: number, tint: string | undefined, label: string) {
  return {
    tint:
      tint && p > 0
        ? interpolateColor(p, [0, 1], [`${tint}00`, tint])
        : undefined,
    label: interpolateColor(p, [0, 1], [COLORS.Text.tertiary, label]),
  };
}

function useGlassColors(
  active: boolean,
  tint: string | undefined,
  label: string,
) {
  const progress = useSharedValue(active ? 1 : 0);
  const [p, setP] = React.useState(active ? 1 : 0);

  React.useEffect(() => {
    progress.set(withTiming(active ? 1 : 0, STATE_TIMING));
  }, [active, progress]);

  useAnimatedReaction(
    () => progress.get(),
    (value, prev) => {
      if (prev !== null && value !== prev) scheduleOnRN(setP, value);
    },
  );

  return glassColorsAt(p, tint, label);
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const inert = disabled || loading;
  // Со стеклом неактивность — без прозрачности: стекло внутри полупрозрачного
  // родителя не рисуется. Вместо этого стекло без оттенка и приглушённый текст.
  const dimmed = inert && !GlassView;
  const activeLabel = isPrimary ? COLORS.Text.inverse : COLORS.Text.primary;
  const glassColors = useGlassColors(!inert, GLASS_TINT[variant], activeLabel);
  const labelColor = GlassView ? glassColors.label : activeLabel;

  return (
    <MotiView
      animate={{
        scale: pressed && !inert ? 0.96 : 1,
        opacity: dimmed ? 0.45 : 1,
      }}
      transition={motion.springy}
      style={style}
    >
      <Pressable
        onPress={() => {
          if (inert) return;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={inert}
        accessibilityRole="button"
        accessibilityState={{ disabled: inert, busy: !!loading }}
        style={styles.base}
      >
        {GlassView ? (
          // iOS 26+: нативное стекло, подсветка нажатия — тоже нативная.
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            tintColor={glassColors.tint}
            style={[StyleSheet.absoluteFill, styles.glass]}
          />
        ) : null}
        {!GlassView && isPrimary ? (
          <LinearGradient
            colors={pressed ? gradients.accentPressed : gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.glass]}
          />
        ) : null}
        {!GlassView && variant === 'secondary' ? (
          <MotiView style={[StyleSheet.absoluteFill, styles.secondaryFill]} />
        ) : null}
        {!GlassView && isDanger ? (
          <MotiView style={[StyleSheet.absoluteFill, styles.dangerFill]} />
        ) : null}

        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <Typography variant="subtitle" color={labelColor}>
            {title}
          </Typography>
        )}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  glass: { borderRadius: radius.pill },
  base: {
    minHeight: hitTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  secondaryFill: {
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: COLORS.Stroke.secondary,
  },
  dangerFill: {
    backgroundColor: COLORS.Surface.negativeSubdued,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: COLORS.Text.negative,
  },
});
