import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { WorkoutWithExercises } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

import { formatSetsLine } from '../helpers/format';

interface WorkoutExercisesProps {
  exercises: WorkoutWithExercises['exercises'];
}

// Упражнения дня: превью, название и подходы. Один вид на странице
// программы и на главной.
export function WorkoutExercises({ exercises }: WorkoutExercisesProps) {
  return (
    <View style={styles.list}>
      {exercises.map((exercise) => (
        <View key={exercise.id} style={styles.row}>
          {exercise.thumbnailUrl ? (
            <Image
              source={{ uri: exercise.thumbnailUrl }}
              style={styles.thumb}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Typography variant="heading" color={COLORS.Text.tertiary}>
                {exercise.name.charAt(0).toUpperCase()}
              </Typography>
            </View>
          )}

          <View style={styles.text}>
            <Typography variant="subtitle">{exercise.name}</Typography>

            <Typography variant="body" color={COLORS.Text.secondary}>
              {formatSetsLine(exercise)}
            </Typography>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.xs,
    backgroundColor: COLORS.Surface.secondary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    overflow: 'hidden',
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
