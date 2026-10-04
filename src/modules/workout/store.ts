import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Exercise, WorkoutWithExercises } from '@/modules/programs';
import { mmkvStorageAdapter } from '@/shared/lib/storage/mmkv';

import type { LastLog } from './models/session';

// Активная тренировка — источник правды на устройстве. Здесь только
// состояние и синхронные переходы; сеть и очередь синхронизации — в
// services/workout.ts.

export interface LocalLog {
  clientId: string;
  exerciseId: string;
  setNumber: number;
  repsDone: number | null;
  weight: number | null;
  durationSeconds: number | null;
  skipped: boolean;
  loggedAt: string;
  notes: string | null;
}

export interface ActiveSession {
  localId: string;
  programId: string;
  workoutId: string;
  workout: WorkoutWithExercises;
  startedAt: string;
  currentExerciseIndex: number;
  logs: LocalLog[];
  restEndsAt: string | null;
  restForExerciseId: string | null;
  lastLogs: Record<string, LastLog[]>;
  // Замены на эту тренировку: id упражнения → фактическое упражнение каталога.
  // Подходы заменённого упражнения уходят с actualCatalogExerciseId — история
  // пишется в упражнение-замену. Нет у тренировок до появления замены.
  replacedCatalogIds?: Record<string, string>;
}

interface SessionState {
  active: ActiveSession | null;
  begin: (session: ActiveSession) => void;
  end: () => void;
  // Подход перезаписывает прежний лог того же упражнения и номера.
  upsertLog: (entry: LocalLog) => void;
  appendLog: (entry: LocalLog) => void;
  removeLog: (clientId: string) => void;
  startRest: (exerciseId: string, restSeconds: number) => void;
  extendRest: (seconds: number) => void;
  clearRest: () => void;
  goToExercise: (index: number) => void;
  mergeLastLogs: (extra: Record<string, LastLog[]>) => void;
  // Заменяет упражнение на месте (тот же id и номер в списке).
  replaceExercise: (next: Exercise, actualCatalogId: string) => void;
  // Новое упражнение сразу после упражнения с номером afterIndex.
  insertExercise: (afterIndex: number, exercise: Exercise) => void;
  // Убирает упражнение вместе с его подходами; текущим становится следующее.
  removeExercise: (exerciseId: string) => void;
}

type Update = (active: ActiveSession) => Partial<ActiveSession>;

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => {
      // Все переходы, кроме begin, — no-op без активной тренировки.
      const update = (fn: Update) =>
        set((s) =>
          s.active ? { active: { ...s.active, ...fn(s.active) } } : s,
        );

      return {
        active: null,

        begin: (session) => set({ active: session }),

        end: () => set({ active: null }),

        upsertLog: (entry) =>
          update((a) => ({
            logs: [
              ...a.logs.filter(
                (l) =>
                  !(
                    l.exerciseId === entry.exerciseId &&
                    l.setNumber === entry.setNumber
                  ),
              ),
              entry,
            ],
          })),

        appendLog: (entry) => update((a) => ({ logs: [...a.logs, entry] })),

        removeLog: (clientId) =>
          update((a) => ({
            logs: a.logs.filter((l) => l.clientId !== clientId),
          })),

        startRest: (exerciseId, restSeconds) =>
          update(() => ({
            restEndsAt: new Date(Date.now() + restSeconds * 1000).toISOString(),
            restForExerciseId: exerciseId,
          })),

        extendRest: (seconds) =>
          update((a) =>
            a.restEndsAt
              ? {
                  restEndsAt: new Date(
                    new Date(a.restEndsAt).getTime() + seconds * 1000,
                  ).toISOString(),
                }
              : {},
          ),

        clearRest: () =>
          update(() => ({ restEndsAt: null, restForExerciseId: null })),

        goToExercise: (index) =>
          update((a) => ({
            currentExerciseIndex: Math.max(
              0,
              Math.min(index, a.workout.exercises.length - 1),
            ),
          })),

        mergeLastLogs: (extra) =>
          update((a) => ({ lastLogs: { ...a.lastLogs, ...extra } })),

        replaceExercise: (next, actualCatalogId) =>
          update((a) => ({
            workout: {
              ...a.workout,
              exercises: a.workout.exercises.map((e) =>
                e.id === next.id ? next : e,
              ),
            },
            replacedCatalogIds: {
              ...a.replacedCatalogIds,
              [next.id]: actualCatalogId,
            },
          })),

        insertExercise: (afterIndex, exercise) =>
          update((a) => {
            const exercises = [...a.workout.exercises];
            exercises.splice(afterIndex + 1, 0, exercise);
            return { workout: { ...a.workout, exercises } };
          }),

        removeExercise: (exerciseId) =>
          update((a) => {
            const index = a.workout.exercises.findIndex(
              (e) => e.id === exerciseId,
            );
            if (index === -1) return {};
            const exercises = a.workout.exercises.filter(
              (e) => e.id !== exerciseId,
            );
            const { [exerciseId]: _, ...replacedCatalogIds } =
              a.replacedCatalogIds ?? {};
            const current =
              index < a.currentExerciseIndex
                ? a.currentExerciseIndex - 1
                : a.currentExerciseIndex;
            const restGone = a.restForExerciseId === exerciseId;
            return {
              workout: { ...a.workout, exercises },
              logs: a.logs.filter((l) => l.exerciseId !== exerciseId),
              replacedCatalogIds,
              currentExerciseIndex: Math.max(
                0,
                Math.min(current, exercises.length - 1),
              ),
              ...(restGone
                ? { restEndsAt: null, restForExerciseId: null }
                : {}),
            };
          }),
      };
    },
    {
      name: 'forma.activeSession',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    },
  ),
);
