import type { Exercise } from '@/modules/programs';
import {
  isExerciseFinished,
  nextSetNumber,
  type ActiveSession,
} from '@/modules/workout';
import { RestScreen } from '@/pages/Session/components/RestScreen';

interface RestViewProps {
  active: ActiveSession;
  totalSetsOf: (ex: Exercise) => number;
  onDone: (options?: { sound?: boolean }) => void;
}

// Отдых: что будет дальше — следующий подход этого упражнения, следующее
// упражнение или итог тренировки.
export function RestView({ active, totalSetsOf, onDone }: RestViewProps) {
  const exercises = active.workout.exercises;
  const index = active.currentExerciseIndex;
  const exercise = exercises[index];
  const totalSets = totalSetsOf(exercise);

  const complete = isExerciseFinished(exercise, active.logs, totalSets);
  const isLast = index === exercises.length - 1;
  const next = complete && !isLast ? exercises[index + 1] : exercise;

  return (
    <RestScreen
      nextTitle={complete && isLast ? 'Итог тренировки' : next.name}
      nextSets={
        complete
          ? undefined
          : `Подход ${nextSetNumber(exercise.id, active.logs)} из ${totalSets}`
      }
      nextThumbnailUrl={next.thumbnailUrl}
      onDone={onDone}
    />
  );
}
