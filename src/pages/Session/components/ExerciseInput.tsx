import { StyleSheet, View } from 'react-native';

import type { Exercise } from '@/modules/programs';
import { PreviousResultLabel } from '@/pages/Session/components/PreviousResultLabel';
import { SetTargetLabel } from '@/pages/Session/components/SetTargetLabel';
import { TimedInput } from '@/pages/Session/components/TimedInput';
import { WeightRepsInput } from '@/pages/Session/components/WeightRepsInput';
import { spacing } from '@/theme';
import {
  getPrefill,
  isTimedExercise,
  lastLogForSet,
  nextSetNumber,
  useSessionStore,
} from '@/modules/workout';

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

  const setNumber = nextSetNumber(exercise.id, active.logs);
  const timed = isTimedExercise(exercise);
  const lastLogs = exercise.catalogExerciseId
    ? active.lastLogs[exercise.catalogExerciseId]
    : undefined;
  const prefill = getPrefill(exercise, setNumber, active.logs, lastLogs);
  const lastLog = lastLogForSet(lastLogs, setNumber);

  return (
    <View style={styles.container}>
      {timed ? (
        <>
          {/* У упражнений на время нет карточек — цель и прошлый раз
              показываем над таймером. */}
          <SetTargetLabel exercise={exercise} />
          <PreviousResultLabel lastLog={lastLog} />
          <TimedInput
            key={setNumber}
            onDone={(seconds) => onLog(setNumber, { durationSeconds: seconds })}
          />
        </>
      ) : (
        <WeightRepsInput
          key={setNumber}
          exercise={exercise}
          prefill={prefill}
          lastLog={lastLog}
          onDone={(values) => onLog(setNumber, values)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, alignItems: 'flex-start' },
});
