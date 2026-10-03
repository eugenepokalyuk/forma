import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, radius, shadow, spacing } from '@/theme';

import { GlassView } from '../glass/glass';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Контейнер из Liquid Glass (iOS 26+); без стекла — обычная карточка.
// Заливку под стеклом не кладём: стекло без фона под ним выглядит плоским.
export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.card, !GlassView && styles.fallback, style]}>
      {GlassView ? (
        <GlassView
          glassEffectStyle="regular"
          style={[StyleSheet.absoluteFill, styles.glass]}
        />
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  glass: { borderRadius: radius.xl },
  fallback: {
    backgroundColor: COLORS.Surface.primary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    ...shadow.card,
  },
});
