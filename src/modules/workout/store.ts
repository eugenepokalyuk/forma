import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LastLog } from './models/session';
import type { WorkoutWithExercises } from '@/modules/programs';
import { mmkvStorageAdapter } from '@/shared/lib/storage/mmkv';
import { useOutboxStore, processOutbox } from './sync/outbox';

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
  exerciseNotes: Record<string, string>;
}

interface SetInput {
  repsDone?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  notes?: string | null;
}

interface SessionState {
  active: ActiveSession | null;
  start: (args: {
    programId: string;
    workoutId: string;
    workout: WorkoutWithExercises;
    lastLogs?: Record<string, LastLog[]>;
    exerciseNotes?: Record<string, string>;
  }) => void;
  logSet: (
    exercise: { id: string; restSeconds: number },
    setNumber: number,
    values: SetInput,
  ) => void;
  skipExercise: (exerciseId: string) => void;
  undoSet: (exerciseId: string, setNumber: number) => void;
  goToExercise: (index: number) => void;
  skipRest: () => void;
  extendRest: (seconds: number) => void;
  clearRest: () => void;
  completeSession: (notes?: string) => void;
  discardSession: () => void;
  mergeLastLogs: (extra: Record<string, LastLog[]>) => void;
}

function uuid(): string {
  // expo-crypto недоступен синхронно во всех окружениях — простой RFC4122 v4.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,

      start: ({ programId, workoutId, workout, lastLogs, exerciseNotes }) => {
        const localId = uuid();
        const startedAt = new Date().toISOString();
        set({
          active: {
            localId,
            programId,
            workoutId,
            workout,
            startedAt,
            currentExerciseIndex: 0,
            logs: [],
            restEndsAt: null,
            restForExerciseId: null,
            lastLogs: lastLogs ?? {},
            exerciseNotes: exerciseNotes ?? {},
          },
        });
        useOutboxStore.getState().enqueue({
          type: 'startSession',
          opId: uuid(),
          localId,
          workoutId,
          programId,
          startedAt,
        });
        void processOutbox();
      },

      logSet: (exercise, setNumber, values) => {
        const active = get().active;
        if (!active) return;
        const clientId = uuid();
        const loggedAt = new Date().toISOString();
        const entry: LocalLog = {
          clientId,
          exerciseId: exercise.id,
          setNumber,
          repsDone: values.repsDone ?? null,
          weight: values.weight ?? null,
          durationSeconds: values.durationSeconds ?? null,
          skipped: false,
          loggedAt,
          notes: values.notes ?? null,
        };
        const logs = [
          ...active.logs.filter(
            (l) => !(l.exerciseId === exercise.id && l.setNumber === setNumber),
          ),
          entry,
        ];
        set({
          active: {
            ...active,
            logs,
            restEndsAt: new Date(
              Date.now() + exercise.restSeconds * 1000,
            ).toISOString(),
            restForExerciseId: exercise.id,
          },
        });
        useOutboxStore.getState().enqueue({
          type: 'logSet',
          opId: uuid(),
          localId: active.localId,
          clientId,
          exerciseId: exercise.id,
          setNumber,
          repsDone: entry.repsDone,
          weight: entry.weight,
          durationSeconds: entry.durationSeconds,
          skipped: false,
          notes: entry.notes,
          loggedAt,
          actualCatalogExerciseId: null,
        });
        void processOutbox();
      },

      // Пропуск упражнения целиком — один маркер-лог (setNumber: 0, skipped:
      // true) вместо отметки каждого подхода, так же как на сайте
      // (sessionSlice.skipExercise). В тоннаж/статистику такой лог не входит.
      skipExercise: (exerciseId) => {
        const active = get().active;
        if (!active) return;
        const clientId = uuid();
        const loggedAt = new Date().toISOString();
        const entry: LocalLog = {
          clientId,
          exerciseId,
          setNumber: 0,
          repsDone: null,
          weight: null,
          durationSeconds: null,
          skipped: true,
          loggedAt,
          notes: null,
        };
        set({ active: { ...active, logs: [...active.logs, entry] } });
        useOutboxStore.getState().enqueue({
          type: 'logSet',
          opId: uuid(),
          localId: active.localId,
          clientId,
          exerciseId,
          setNumber: 0,
          repsDone: null,
          weight: null,
          durationSeconds: null,
          skipped: true,
          notes: null,
          loggedAt,
          actualCatalogExerciseId: null,
        });
        void processOutbox();
      },

      undoSet: (exerciseId, setNumber) => {
        const active = get().active;
        if (!active) return;
        const target = active.logs.find(
          (l) => l.exerciseId === exerciseId && l.setNumber === setNumber,
        );
        if (!target) return;
        set({
          active: {
            ...active,
            logs: active.logs.filter((l) => l !== target),
          },
        });
        useOutboxStore.getState().enqueue({
          type: 'undoSet',
          opId: uuid(),
          localId: active.localId,
          exerciseId,
          setNumber,
          targetClientId: target.clientId,
        });
        void processOutbox();
      },

      goToExercise: (index) => {
        const active = get().active;
        if (!active) return;
        const clamped = Math.max(
          0,
          Math.min(index, active.workout.exercises.length - 1),
        );
        set({ active: { ...active, currentExerciseIndex: clamped } });
      },

      skipRest: () =>
        set((s) =>
          s.active
            ? {
                active: {
                  ...s.active,
                  restEndsAt: null,
                  restForExerciseId: null,
                },
              }
            : s,
        ),

      extendRest: (seconds) =>
        set((s) => {
          if (!s.active?.restEndsAt) return s;
          const next = new Date(
            new Date(s.active.restEndsAt).getTime() + seconds * 1000,
          ).toISOString();
          return { active: { ...s.active, restEndsAt: next } };
        }),

      clearRest: () =>
        set((s) =>
          s.active
            ? {
                active: {
                  ...s.active,
                  restEndsAt: null,
                  restForExerciseId: null,
                },
              }
            : s,
        ),

      completeSession: (notes) => {
        const active = get().active;
        if (!active) return;
        if (active.logs.length === 0) {
          get().discardSession();
          return;
        }
        useOutboxStore.getState().enqueue({
          type: 'complete',
          opId: uuid(),
          localId: active.localId,
          notes: notes ?? null,
        });
        set({ active: null });
        void processOutbox();
      },

      discardSession: () => {
        const active = get().active;
        if (!active) return;
        useOutboxStore.getState().clearSessionOps(active.localId);
        useOutboxStore.getState().enqueue({
          type: 'discard',
          opId: uuid(),
          localId: active.localId,
        });
        set({ active: null });
        void processOutbox();
      },

      mergeLastLogs: (extra) => {
        const active = get().active;
        if (!active) return;
        set({
          active: { ...active, lastLogs: { ...active.lastLogs, ...extra } },
        });
      },
    }),
    {
      name: 'forma.activeSession',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    },
  ),
);

export function tonnage(logs: LocalLog[]): number {
  return logs.reduce((sum, l) => sum + (l.weight ?? 0) * (l.repsDone ?? 0), 0);
}
