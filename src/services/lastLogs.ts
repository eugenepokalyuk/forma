import { getLastLogApi, type LastLog, type WorkoutWithExercises } from '@/api';
import { useSessionStore } from '@/store/session';

// Подсказка «прошлый раз» — необязательна, тренировку начинаем без неё, если
// сети нет; подтягиваем в фоне и докладываем в стор, когда придёт.
export function loadLastLogs(workout: WorkoutWithExercises) {
  const catalogIds = [
    ...new Set(
      workout.exercises
        .map((e) => e.catalogExerciseId)
        .filter((v): v is string => !!v),
    ),
  ];

  void Promise.all(
    catalogIds.map((catalogId) =>
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
