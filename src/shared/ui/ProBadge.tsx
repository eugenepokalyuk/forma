import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, HEADING_ITALIC, radius, spacing } from '@/theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

// Бейдж ПРО-программы: жёлтая плашка, корона и «ПРО» курсивом.
export function ProBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.badge, style]} accessibilityLabel="ПРО">
      <Icon name="crown" size={12} color={COLORS.Text.inverse} />

      <Typography
        variant="caption"
        color={COLORS.Text.inverse}
        style={styles.text}
      >
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
    backgroundColor: COLORS.Surface.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  text: { fontFamily: HEADING_ITALIC.extraBold, fontSize: 14 },
});
