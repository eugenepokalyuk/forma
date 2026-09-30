import { MotiView } from 'moti';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input, StatTile, Typography } from '@/components/ui';
import { COLORS, spacing } from '@/theme';
import { formatMMSS } from '@/utils/format';
import { tonnage, useSessionStore } from '@/store/session';

export function SessionSummary({
  elapsed,
  onBack,
}: {
  elapsed: number;
  onBack: () => void;
}) {
  const insets = SafeArea.useSafeAreaInsets();
  const active = useSessionStore((s) => s.active);
  const completeSession = useSessionStore((s) => s.completeSession);
  const [notes, setNotes] = React.useState('');

  const stats = React.useMemo(() => {
    if (!active) return { sets: 0, tonnage: 0 };
    return {
      sets: active.logs.filter((l) => !l.skipped).length,
      tonnage: tonnage(active.logs),
    };
  }, [active]);

  if (!active) return null;

  if (stats.sets === 0) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      >
        <Typography variant="display" style={{ marginBottom: spacing.md }}>
          {'Тренировка не засчитана'}
        </Typography>

        <Typography variant="body" color={COLORS.Text.secondary} align="center">
          {'Нет ни одного сохранённого подхода'}
        </Typography>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <Button
            title="Назад"
            variant="secondary"
            onPress={onBack}
            style={{ flex: 1 }}
          />

          <Button
            title="Завершить"
            onPress={() => completeSession(notes)}
            style={{ flex: 1 }}
          />
        </View>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={[styles.container, { paddingTop: insets.top + spacing.lg }]}
    >
      <Typography variant="display" style={{ marginBottom: spacing.md }}>
        {'Итог тренировки'}
      </Typography>

      <View style={styles.statsRow}>
        <StatTile
          icon="clock-outline"
          label="Время"
          value={formatMMSS(elapsed)}
          tint={COLORS.Text.accent}
        />
        <StatTile
          icon="format-list-numbered"
          label="Подходов"
          value={String(stats.sets)}
          tint={COLORS.Text.teal}
        />
        <StatTile
          icon="weight-lifter"
          label="Тоннаж"
          value={`${Math.round(stats.tonnage)} кг`}
          tint={COLORS.Text.positive}
        />
      </View>

      <Input
        style={styles.notesInput}
        placeholder="Заметка о тренировке"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View
        style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}
      >
        <Button
          title="Назад"
          variant="secondary"
          onPress={onBack}
          style={{ flex: 1 }}
        />
        <Button
          title="Готово"
          onPress={() => completeSession(notes)}
          style={{ flex: 1 }}
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
    padding: spacing.md,
    justifyContent: 'center',
    gap: spacing.md,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  notesInput: { marginTop: spacing.md },
});
