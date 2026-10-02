import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/modules/programs';
import { Button, Divider, Typography } from '@/shared/ui';
import { Stepper } from '@/pages/Session/components/Stepper';
import { COLORS, radius, spacing } from '@/theme';
import {
  formatLastLog,
  formatTarget,
  type LastLog,
  type SetPrefill,
} from '@/modules/workout';

interface WeightRepsInputProps {
  exercise: Exercise;
  prefill: SetPrefill;
  lastLog: LastLog | undefined;
  onDone: (values: { repsDone: number; weight: number | null }) => void;
}

// Вес (для strength/band) + повторения — карточки: степпер, подпись и под ней
// подсказка — прошлый вес под «Вес», цель подхода под «Повторы».
export function WeightRepsInput({
  exercise,
  prefill,
  lastLog,
  onDone,
}: WeightRepsInputProps) {
  const [weight, setWeight] = React.useState(prefill.weight);
  const [reps, setReps] = React.useState(prefill.reps);
  const showWeight =
    exercise.exerciseType === 'strength' || exercise.exerciseType === 'band';

  const target = formatTarget(exercise);
  const weightHint = lastLog?.weight
    ? `в прошлый раз ${lastLog.weight} кг`
    : undefined;
  const repsHints = [
    target !== '—' ? `${target}` : undefined,
    // Без карточки «Вес» прошлый результат показываем здесь.
    !showWeight && lastLog
      ? `в прошлый раз ${formatLastLog(lastLog)}`
      : undefined,
  ];

  const repsField = (
    <View style={[styles.fieldRow, showWeight && styles.fieldHalf]}>
      <Stepper value={reps} step={1} compact={showWeight} onChange={setReps} />

      <Divider />

      <FieldLabel label="Повторы" hints={repsHints} />
    </View>
  );

  return (
    <View style={styles.container}>
      {showWeight ? (
        <View style={styles.columns}>
          <View style={[styles.fieldRow, styles.fieldHalf]}>
            <Stepper
              value={weight}
              step={2.5}
              suffix="кг"
              compact
              onChange={setWeight}
            />

            <Divider />

            <FieldLabel label="Вес" hints={[weightHint]} />
          </View>

          {repsField}
        </View>
      ) : (
        repsField
      )}

      <Button
        title="Далее"
        variant="secondary"
        onPress={() =>
          onDone({ weight: showWeight ? weight : null, repsDone: reps })
        }
        style={{ width: '100%' }}
      />
    </View>
  );
}

// Подпись карточки и подсказки под ней (пустые не выводятся).
function FieldLabel({
  label,
  hints,
}: {
  label: string;
  hints: (string | undefined)[];
}) {
  return (
    <View style={styles.label}>
      <Typography variant="body" color={COLORS.Text.primary}>
        {label}
      </Typography>

      {hints.filter(Boolean).map((hint) => (
        <Typography
          key={hint}
          variant="body"
          color={COLORS.Text.secondary}
          align="center"
        >
          {hint}
        </Typography>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    gap: 2,
  },
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  columns: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    minHeight: 48,
  },
  fieldHalf: { flex: 1, width: undefined },
});
