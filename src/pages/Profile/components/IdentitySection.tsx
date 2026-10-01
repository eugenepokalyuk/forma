import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Section, Typography } from '@/components/ui';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuthStore } from '@/store/auth';
import { COLORS, radius, spacing } from '@/theme';

export function IdentitySection() {
  const user = useAuthStore((s) => s.user);

  return (
    <Section>
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(255,214,10,0.16)', 'rgba(255,214,10,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <UserAvatar
          url={user?.avatarUrl ?? null}
          name={user?.name || user?.email || '?'}
          pro={user?.hasProAccess}
          size={92}
        />

        <Typography variant="display">{user?.name || 'Без имени'}</Typography>

        <Typography variant="body" color={COLORS.Text.secondary}>
          {user?.email}
        </Typography>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.primary,
  },
});
