import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, HEADING_ITALIC, radius, spacing } from '@/theme';

import { Typography } from './Typography';

// Бейдж ПРО-программы: жёлтая плашка, корона и «ПРО» курсивом.
export function ProBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.badge, style]} accessibilityLabel="ПРО">
      <Typography variant="body" color={COLORS.Text.accent} style={styles.text}>
        {'ПРО'}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { fontFamily: HEADING_ITALIC.extraBold },
});
