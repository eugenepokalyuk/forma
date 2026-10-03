import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { GlassView } from '../glass/glass';
import { Icon, type IconName } from '../text/Icon';
import { COLORS, motion, radius } from '@/theme';

type Variant = 'neutral' | 'accent';

const SIZE = 48;

// Заливка — только без стекла (Android, старые iOS): под стеклом она
// сделала бы кнопку плоской — стеклу нечего преломлять. Стекло тонируется
// тем же цветом.
const FILL: Record<Variant, string> = {
  neutral: COLORS.Surface.secondary,
  accent: COLORS.Surface.accent,
};
const GLASS_TINT: Record<Variant, string | undefined> = {
  neutral: undefined,
  accent: COLORS.Surface.accent,
};
const ICON_COLOR: Record<Variant, string> = {
  neutral: COLORS.Icon.primary,
  accent: COLORS.Icon.inverse,
};

interface GlassIconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  variant?: Variant;
}

// Круглая кнопка-иконка: на iOS 26+ — Liquid Glass, как у Button.
export function GlassIconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'neutral',
}: GlassIconButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <MotiView
      animate={{ scale: pressed ? 0.9 : 1 }}
      transition={motion.springy}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.button,
          !GlassView && { backgroundColor: FILL[variant] },
          !GlassView && variant === 'neutral' && styles.outline,
        ]}
      >
        {GlassView ? (
          <GlassView
            glassEffectStyle="regular"
            isInteractive
            tintColor={GLASS_TINT[variant]}
            // Скругляем само стекло, а не обрезаем его кнопкой: иначе
            // блик по краю квадратного стекла срезается кругом.
            style={[StyleSheet.absoluteFill, styles.glass]}
          />
        ) : null}

        <Icon name={icon} size={24} color={ICON_COLOR[variant]} />
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: { borderRadius: SIZE / 2 },
  outline: { borderWidth: 1, borderColor: COLORS.Stroke.secondary },
});
