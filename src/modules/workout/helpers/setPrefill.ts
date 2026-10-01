import type { Exercise } from '@/modules/programs';
import type { LastLog } from '../models/session';
import type { LocalLog } from '../store';

export interface SetPrefill {
  weight: number;
  reps: number;
}

// Подставка веса/повторов для следующего подхода: сначала предыдущий подход
// этой же тренировки, потом прошлый раз (lastLogs с сервера), иначе — цель
// упражнения из программы.
export function getPrefill(
  exercise: Exercise,
  setNumber: number,
  logs: LocalLog[],
  lastLogs: LastLog[] | undefined,
): SetPrefill {
  const prevInSession = logs.find(
    (l) => l.exerciseId === exercise.id && l.setNumber === setNumber - 1,
  );
  if (prevInSession) {
    return {
      weight: prevInSession.weight ?? 0,
      reps: prevInSession.repsDone ?? exercise.repsMax ?? exercise.repsMin ?? 0,
    };
  }

  const lastLogSameSet =
    lastLogs?.find((l) => l.setNumber === setNumber) ?? lastLogs?.[0];
  if (lastLogSameSet) {
    return {
      weight: lastLogSameSet.weight ?? 0,
      reps:
        lastLogSameSet.repsDone ?? exercise.repsMax ?? exercise.repsMin ?? 0,
    };
  }

  return { weight: 0, reps: exercise.repsMax ?? exercise.repsMin ?? 0 };
}
