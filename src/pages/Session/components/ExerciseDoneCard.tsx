import { StyleSheet, View } from 'react-native';

import { Button, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

interface ExerciseDoneCardProps {
  setsDone: number;
  // Добавить подход сверх сделанных — после него снова появится ввод.
  onAddSet: () => void;
}

// Вместо ввода на выполненном упражнении: к нему вернулись с полосы
// упражнений — например, чтобы сделать ещё один подход.
export function ExerciseDoneCard({
  setsDone,
  onAddSet,
}: ExerciseDoneCardProps) {
  return (
    <View style={styles.card}>
      <Typography variant="title" color={COLORS.Text.primary}>
        {'Упражнение выполнено'}
      </Typography>

      <Typography variant="body" color={COLORS.Text.secondary}>
        {`Сделано подходов: ${setsDone}\nНужен ещё один — жми на кнопку`}
      </Typography>

      <Button title="Ещё подход" variant="secondary" onPress={onAddSet} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.positiveSubdued,
  },
});
