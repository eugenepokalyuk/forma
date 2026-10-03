import { StyleSheet, View } from 'react-native';

import { ErrorState, Section, StatTile } from '@/shared/ui';
import { useProfileStats } from '@/pages/Profile/hooks/useProfileStats';
import { COLORS, spacing } from '@/theme';

export function StatsSection() {
  const { data, isError, refetch, streak, workoutsCount, totalTonnage } =
    useProfileStats();

  // Без истории тренировок нули выглядели бы как реальные итоги.
  if (isError && !data) {
    return (
      <Section title="Итоги">
        <ErrorState onRetry={refetch} />
      </Section>
    );
  }

  return (
    <Section title="Итоги" padding>
      <View style={styles.row}>
        <StatTile
          icon="fire"
          value={String(streak)}
          label="Серия, дней"
          tint={COLORS.Text.accent}
        />
        <StatTile
          icon="trophy-outline"
          value={String(workoutsCount)}
          label="Тренировок"
          tint={COLORS.Text.teal}
        />
        <StatTile
          icon="weight-lifter"
          value={`${Math.round(totalTonnage / 1000)}т`}
          label="Тоннаж"
          tint={COLORS.Text.positive}
        />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});
