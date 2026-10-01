import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

// Имя, описание и мышцы упражнения — по центру, без карточки-подложки
// (плашки мышц не разбиты на «основные/вспомогательные», просто один ряд).
export function ExerciseHeaderCard({ exercise }: { exercise: Exercise }) {
  const muscles = exercise.muscles.map((m) => m.name);

  return (
    <View style={styles.container}>
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
            <View key={`${name}-${i}`} style={styles.muscleChip}>
              <Typography variant="label" color={COLORS.Text.secondary}>
                {name}
              </Typography>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.xs },
  description: { paddingHorizontal: spacing.md },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  muscleChip: {
    borderWidth: 1,
    borderColor: COLORS.Stroke.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
