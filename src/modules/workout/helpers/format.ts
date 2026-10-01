import type { Exercise } from '@/modules/programs';

import type { LastLog } from '../models/session';
import { formatMMSS } from '@/shared/lib/string/number';

const TIMED_TYPES = new Set(['cardio', 'stretch', 'yoga']);

export function isTimedExercise(exercise: Exercise) {
  return TIMED_TYPES.has(exercise.exerciseType);
}

// Цель подхода: repsMin–repsMax (или одно число, если равны), для временных
// типов — durationSeconds в формате мм:сс (если секунды 00 — «N мин», без
// «:00», чтобы не путать с числом повторов).
export function formatTarget(exercise: Exercise): string {
  if (isTimedExercise(exercise) && exercise.durationSeconds != null) {
    const seconds = exercise.durationSeconds % 60;
    return seconds === 0
      ? `${Math.floor(exercise.durationSeconds / 60)} мин`
      : formatMMSS(exercise.durationSeconds);
  }

  const { repsMin, repsMax } = exercise;

  if (repsMin != null && repsMax != null) {
    return repsMin === repsMax ? String(repsMin) : `${repsMin}–${repsMax}`;
  }

  return String(repsMin ?? repsMax ?? '—');
}

// «8–12 повторов» / «5:00» — цель подхода с подписью единицы (для временных
// упражнений единица уже внутри formatTarget, для остальных дописываем слово).
export function formatTargetLabel(exercise: Exercise): string {
  const target = formatTarget(exercise);
  return isTimedExercise(exercise) ? target : `${target} повторов`;
}

// Для временного упражнения с одним подходом сама длительность уже
// однозначна — «1 ×» перед ней только шумит.
export function formatSetsLine(exercise: Exercise): string {
  const target = formatTarget(exercise);

  if (isTimedExercise(exercise) && exercise.sets === 1) {
    return target;
  }

  return `${exercise.sets} × ${target}`;
}

// «40 кг × 10», «12 повт.» (свой вес), «5:00» (на время).
export function formatLastLog(log: LastLog): string {
  if (log.weight && log.repsDone != null) {
    return `${log.weight} кг × ${log.repsDone}`;
  }
  if (log.weight) return `${log.weight} кг`;
  if (log.repsDone != null) return `${log.repsDone} повт.`;
  return formatMMSS(log.durationSeconds ?? 0);
}
