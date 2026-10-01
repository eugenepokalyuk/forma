import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { WorkoutWithExercises } from '@/modules/programs';
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
      };
    },
    {
      name: 'forma.activeSession',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    },
  ),
);
