import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Logo, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { useAuthStore } from '../store';

// Шапка главных вкладок — логотип + бейдж ПРО, один в один на всех экранах
export function AppHeader() {
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);

  const onPress = () => {
    Alert.alert(
      'ПРО доступен на сайте',
      'Оформить подписку можно на forma-one.ru',
    );
  };

  return (
    <View style={styles.topBar}>
      <Logo />

      {hasProAccess ? null : (
        <Pressable onPress={onPress} style={styles.proBadge}>
          <Typography variant="title" color={COLORS.Text.accent}>
            {'ПРО'}
          </Typography>

          <Typography variant="title" color={COLORS.Text.primary}>
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
