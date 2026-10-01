import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/api';
import { Button } from '@/components/Button';
import { Stepper } from '@/pages/Session/components/Stepper';
import { Divider, Typography } from '@/components/ui';
import { COLORS, radius, spacing } from '@/theme';
import type { SetPrefill } from '@/utils/helpers/exercise/setPrefill';

interface WeightRepsInputProps {
  exercise: Exercise;
  prefill: SetPrefill;
  onDone: (values: { repsDone: number; weight: number | null }) => void;
}

// Вес (для strength/band) + повторения — степперы в компактных строках,
// подпись слева, значение справа.
export function WeightRepsInput({
  exercise,
  prefill,
  onDone,
}: WeightRepsInputProps) {
  const [weight, setWeight] = React.useState(prefill.weight);
  const [reps, setReps] = React.useState(prefill.reps);
  const showWeight =
    exercise.exerciseType === 'strength' || exercise.exerciseType === 'band';

  const repsField = (
    <View style={[styles.fieldRow, showWeight && styles.fieldHalf]}>
      <Typography variant="body" color={COLORS.Text.primary}>
        {'Повторы'}
      </Typography>

      <Divider />

      <Stepper value={reps} step={1} compact={showWeight} onChange={setReps} />
    </View>
  );

  return (
    <View style={styles.container}>
      {showWeight ? (
        <View style={styles.columns}>
          <View style={[styles.fieldRow, styles.fieldHalf]}>
            <Typography variant="body" color={COLORS.Text.primary}>
              {'Вес'}
            </Typography>

            <Divider />

            <Stepper
              value={weight}
              step={2.5}
              suffix="кг"
              compact
              onChange={setWeight}
            />
          </View>

          {repsField}
        </View>
      ) : (
        repsField
      )}

      <Button
        title="Далее"
        onPress={() =>
          onDone({ weight: showWeight ? weight : null, repsDone: reps })
        }
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: spacing.sm },
  columns: { flexDirection: 'row', width: '100%', gap: spacing.sm },
  fieldRow: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  fieldHalf: { flex: 1, width: undefined },
});
