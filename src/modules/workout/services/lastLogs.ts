import { getLastLogApi } from '../api/getLastLogApi';
import type { LastLog } from '../models/session';
import type { WorkoutWithExercises } from '@/modules/programs';
import { useSessionStore } from '../store';

// Подсказка «прошлый раз» — необязательна, тренировку начинаем без неё, если
// сети нет; подтягиваем в фоне и докладываем в стор, когда придёт.
export function loadLastLogs(workout: WorkoutWithExercises) {
  loadLastLogsFor(
    workout.exercises
      .map((e) => e.catalogExerciseId)
      .filter((v): v is string => !!v),
  );
}

// То же для отдельных упражнений — заменённого или добавленного.
export function loadLastLogsFor(catalogIds: string[]) {
  void Promise.all(
    [...new Set(catalogIds)].map((catalogId) =>
      getLastLogApi(catalogId)
        .then((logs) => [catalogId, logs] as const)
        .catch(() => null),
    ),
  ).then((results) => {
    const merged: Record<string, LastLog[]> = {};
    for (const r of results) {
      if (r) merged[r[0]] = r[1];
    }
    if (Object.keys(merged).length > 0)
      useSessionStore.getState().mergeLastLogs(merged);
  });
}
