import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/api';
import { PreviousResultLabel } from '@/components/session/PreviousResultLabel';
import { SetTargetLabel } from '@/components/session/SetTargetLabel';
import { TimedInput } from '@/components/session/TimedInput';
import { WeightRepsInput } from '@/components/session/WeightRepsInput';
import { Divider } from '@/components/ui';
import { spacing } from '@/theme';
import { isTimedExercise } from '@/utils/helpers/exercise/format';
import { getPrefill } from '@/utils/helpers/exercise/setPrefill';
import { useSessionStore } from '@/store/session';

interface ExerciseInputProps {
  exercise: Exercise;
  onLog: (
    setNumber: number,
    values: {
      repsDone?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
    },
  ) => void;
}

// Ввод результата подхода — таймер для кардио/растяжки/йоги, вес+повторения
// для остального. Цель подхода — между дивайдерами, как в макете.
export function ExerciseInput({ exercise, onLog }: ExerciseInputProps) {
  const active = useSessionStore((s) => s.active);
  if (!active) return null;

  const logs = active.logs.filter(
    (l) => l.exerciseId === exercise.id && !l.skipped,
  );
  const setNumber = logs.length + 1;
  const timed = isTimedExercise(exercise);
  const lastLogs = exercise.catalogExerciseId
    ? active.lastLogs[exercise.catalogExerciseId]
    : undefined;
  const prefill = getPrefill(exercise, setNumber, active.logs, lastLogs);

  return (
    <View style={styles.container}>
      <SetTargetLabel exercise={exercise} />

      {timed ? (
        <TimedInput
          key={setNumber}
          onDone={(seconds) => onLog(setNumber, { durationSeconds: seconds })}
        />
      ) : (
        <WeightRepsInput
          key={setNumber}
          exercise={exercise}
          prefill={prefill}
          onDone={(values) => onLog(setNumber, values)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, alignItems: 'flex-start' },
});
