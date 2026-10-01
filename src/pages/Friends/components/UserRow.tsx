import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { PublicUser } from '@/modules/social';
import { Typography, UserAvatar } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

interface UserRowProps {
  user: PublicUser;
  /** Что показывать справа. По умолчанию — кнопка подписки. */
  trailing?: ReactNode;
}

export function UserRow({ user, trailing }: UserRowProps) {
  return (
    <View style={styles.row}>
      <UserAvatar
        url={user.avatarUrl}
        name={user.name}
        size={44}
        pro={user.hasProAccess}
      />

      <View style={styles.texts}>
        <Typography variant="subtitle" numberOfLines={1}>
          {user.name}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.tertiary}
          numberOfLines={1}
        >
          {user.email}
        </Typography>
      </View>

      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  texts: { flex: 1, gap: 2 },
});
