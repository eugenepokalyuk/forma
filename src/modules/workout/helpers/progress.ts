import type { Exercise } from '@/modules/programs';

import type { LocalLog } from '../store';

// Сделанные подходы упражнения (маркер пропуска не считается).
export function doneSetsCount(exercise: Exercise, logs: LocalLog[]): number {
  return logs.filter((l) => l.exerciseId === exercise.id && !l.skipped).length;
}

export function isExerciseSkipped(
  exercise: Exercise,
  logs: LocalLog[],
): boolean {
  return logs.some((l) => l.exerciseId === exercise.id && l.skipped);
}

// Выполнено: сделаны все подходы, включая добавленные сверх плана.
export function isExerciseDone(
  exercise: Exercise,
  logs: LocalLog[],
  totalSets: number,
): boolean {
  return doneSetsCount(exercise, logs) >= totalSets;
}

// Закончено — выполнено или пропущено: к нему больше не возвращаемся.
export function isExerciseFinished(
  exercise: Exercise,
  logs: LocalLog[],
  totalSets: number,
): boolean {
  return (
    isExerciseSkipped(exercise, logs) ||
    isExerciseDone(exercise, logs, totalSets)
  );
}

// --- Переходы между упражнениями тренировки ---

export type WorkoutStep =
  { kind: 'exercise'; index: number } | { kind: 'summary' };

// Переход к упражнению index. Уже законченные (все подходы или пропуск)
// проходим насквозь — иначе на них можно было бы записать «фантомный»
// подход сверх плана; дальше последнего — итог тренировки.
export function stepToExercise(
  exercises: Exercise[],
  logs: LocalLog[],
  index: number,
  totalSetsOf: (exercise: Exercise) => number,
): WorkoutStep {
  let target = Math.max(0, index);
  while (
    target < exercises.length &&
    isExerciseFinished(exercises[target], logs, totalSetsOf(exercises[target]))
  ) {
    target += 1;
  }
  return target >= exercises.length
    ? { kind: 'summary' }
    : { kind: 'exercise', index: target };
}

// Конец отдыха: упражнение закончено — дальше, иначе к нему же на
// следующий подход.
export function stepAfterRest(
  exercises: Exercise[],
  logs: LocalLog[],
  currentIndex: number,
  totalSetsOf: (exercise: Exercise) => number,
): WorkoutStep {
  const current = exercises[currentIndex];
  return isExerciseFinished(current, logs, totalSetsOf(current))
    ? stepToExercise(exercises, logs, currentIndex + 1, totalSetsOf)
    : { kind: 'exercise', index: currentIndex };
}
