import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, radius, spacing } from '@/theme';

import { Typography } from './Typography';

interface BadgeProps {
  label: string;
  /** accent — пометка («Сегодня»), outline — тег (мышца). */
  tone?: 'accent' | 'outline';
  style?: StyleProp<ViewStyle>;
}

// Короткая подпись-«пилюля» рядом с заголовком или в ряду тегов.
export function Badge({ label, tone = 'accent', style }: BadgeProps) {
  const accent = tone === 'accent';

  return (
    <View
      style={[styles.badge, accent ? styles.accent : styles.outline, style]}
    >
      <Typography
        variant="label"
        color={accent ? COLORS.Text.accent : COLORS.Text.secondary}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  accent: { backgroundColor: COLORS.Surface.accentSubdued },
  outline: { borderWidth: 1, borderColor: COLORS.Stroke.secondary },
});
