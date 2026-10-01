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
