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
  const labelColor =
    inert && GlassView
      ? COLORS.Text.tertiary
      : isPrimary
        ? COLORS.Text.inverse
        : COLORS.Text.primary;

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
            tintColor={inert ? undefined : GLASS_TINT[variant]}
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
