import { Pressable, StyleSheet, View } from 'react-native';

import { Logo, Typography } from '@/shared/ui';
import { COLORS, HEADING_ITALIC, radius, spacing } from '@/theme';
import { showProInfo } from '../helpers/showProInfo';
import { useAuthStore } from '../store';

// Шапка главных вкладок — логотип + бейдж ПРО, один в один на всех экранах
export function AppHeader() {
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);

  return (
    <View style={styles.topBar}>
      <Logo />

      {hasProAccess ? null : (
        <Pressable onPress={showProInfo} style={styles.proBadge}>
          <Typography
            variant="title"
            color={COLORS.Text.accent}
            style={styles.badgeText}
          >
            {'ПРО'}
          </Typography>

          <Typography
            variant="title"
            color={COLORS.Text.primary}
            style={styles.badgeText}
          >
            {'БЕСПЛАТНО'}
          </Typography>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  // «ПРО БЕСПЛАТНО» — курсивом, как бейджи ПРО на карточках.
  badgeText: { fontFamily: HEADING_ITALIC.bold },
  proBadge: {
    flexDirection: 'row',
    gap: 4,

    borderWidth: 1,
    borderColor: COLORS.Stroke.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
