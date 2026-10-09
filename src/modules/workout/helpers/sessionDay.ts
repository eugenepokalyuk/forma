import type { Exercise } from '@/modules/programs';
import { isSameDay } from '@/shared/lib/date/calendar';

import type { Session, SessionWithWorkout } from '../models/session';

// День тренировки: завершённой — по завершению (как отметки недели),
// незавершённой — по старту.
export function sessionDate(session: Session): Date {
  return new Date(session.completedAt ?? session.startedAt);
}

// Тренировки дня — в порядке начала.
export function sessionsOnDay<S extends Session>(
  sessions: S[],
  day: Date,
): S[] {
  return sessions
    .filter((s) => isSameDay(sessionDate(s), day))
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );
}

export interface ExerciseResult {
  exercise: Exercise;
  setsDone: number;
  skipped: boolean;
}

// Что сделано по каждому упражнению тренировки: подходы и пропуски.
export function sessionExerciseResults(
  session: SessionWithWorkout,
): ExerciseResult[] {
  return session.workout.exercises.map((exercise) => {
    const logs = session.exerciseLogs.filter(
      (l) => l.exerciseId === exercise.id,
    );
    return {
      exercise,
      setsDone: logs.filter((l) => !l.skipped).length,
      skipped: logs.some((l) => l.skipped),
    };
  });
}
