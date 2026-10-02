import type { Session } from '../models/session';

/** Следующая по плану тренировка программы: по кругу после последней
 * завершённой (как в forma-next TodayView.todayWorkout). Тренировки — в
 * порядке программы (dayNumber сквозной по неделям). */
export function getNextWorkout<W extends { id: string }>(
  programWorkouts: W[],
  history: Session[],
  programId: string,
): W | null {
  if (programWorkouts.length === 0) return null;

  const programSessions = history
    .filter((s) => s.programId === programId && s.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

  if (programSessions.length === 0) return programWorkouts[0];

  const lastIdx = programWorkouts.findIndex(
    (w) => w.id === programSessions[0].workoutId,
  );
  if (lastIdx === -1) return programWorkouts[0];

  return programWorkouts[(lastIdx + 1) % programWorkouts.length];
}

/** Прогресс по программе: текущая (следующая по плану) тренировка и
 * пройденные в этом круге — завершённые и стоящие до текущей. Когда план
 * пошёл по кругу, отметки сбрасываются: новый круг начинается с чистого листа. */
export function getProgramProgress<W extends { id: string }>(
  programWorkouts: W[],
  history: Session[],
  programId: string,
): { current: W | null; doneIds: Set<string> } {
  const current = getNextWorkout(programWorkouts, history, programId);
  const currentIdx = current ? programWorkouts.indexOf(current) : 0;

  const completed = new Set(
    history
      .filter((s) => s.programId === programId && s.status === 'completed')
      .map((s) => s.workoutId),
  );
  const doneIds = new Set(
    programWorkouts
      .slice(0, currentIdx)
      .filter((w) => completed.has(w.id))
      .map((w) => w.id),
  );

  return { current, doneIds };
}
