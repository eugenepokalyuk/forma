import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui';
import { useOutboxStore } from '@/store/outbox';
import { COLORS, motion, radius, spacing } from '@/theme';

// Плашка о несинхронизированных действиях из очереди outbox.
export function SyncBanner() {
  const pending = useOutboxStore((s) => s.ops.length);

  if (pending === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.springSoft}
      style={styles.banner}
    >
      <View style={styles.dot} />

      <Typography variant="caption" color={COLORS.Text.accent}>
        Не синхронизировано: {pending}
      </Typography>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: COLORS.Surface.accentSubdued,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.Surface.accent,
  },
});
