import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/modules/programs';
import { Badge, Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

// Имя, описание и мышцы упражнения — по центру, без карточки-подложки
// (плашки мышц не разбиты на «основные/вспомогательные», просто один ряд).
export function ExerciseHeaderCard({ exercise }: { exercise: Exercise }) {
  const muscles = exercise.muscles.map((m) => m.name);

  return (
    <View style={styles.container}>
      {/* Своё упражнение, добавленное поверх программы, — его можно скрыть. */}
      {exercise.isCustom ? (
        <Badge label="Добавлено вами" style={styles.customBadge} />
      ) : null}

      <Typography variant="display" align="center">
        {exercise.name}
      </Typography>

      {exercise.description ? (
        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          align="center"
          style={styles.description}
        >
          {exercise.description}
        </Typography>
      ) : null}

      {muscles.length > 0 ? (
        <View style={styles.muscleRow}>
          {muscles.map((name, i) => (
            <Badge key={`${name}-${i}`} label={name} tone="outline" />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  description: {
    paddingHorizontal: spacing.md,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  customBadge: {
    marginBottom: spacing.md,
  },
});
