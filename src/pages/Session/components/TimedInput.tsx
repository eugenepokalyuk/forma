import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatMMSS } from '@/shared/lib/string/number';

// Секундомер для кардио/растяжки/йоги — время слева, круглая ▶/■ справа.
export function TimedInput({ onDone }: { onDone: (seconds: number) => void }) {
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => clearInterval(id);
  }, [running]);

  return (
    <View style={styles.row}>
      <Typography variant="display" style={{ fontSize: 28, flex: 1 }}>
        {formatMMSS(seconds)}
      </Typography>
      <Pressable
        onPress={() => {
          if (running) {
            setRunning(false);
            onDone(seconds);
          } else {
            setRunning(true);
          }
        }}
        style={[styles.btn, running && styles.btnStop]}
        accessibilityRole="button"
        accessibilityLabel={
          running ? 'Остановить и записать подход' : 'Запустить таймер'
        }
      >
        <Icon
          name={running ? 'stop' : 'play'}
          size={20}
          color={running ? COLORS.Text.negative : COLORS.Text.inverse}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStop: { backgroundColor: COLORS.Surface.negativeSubdued },
});
