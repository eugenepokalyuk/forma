import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ReactionValue } from '@/modules/programs';
import { mmkvStorageAdapter } from '@/shared/lib/storage/mmkv';

// Очередь синхронизации: во время тренировки источник правды — устройство,
// сервер получает данные из этой очереди, когда появляется сеть. Ни одно
// действие в режиме выполнения не ждёт ответа сети (см. ТЗ, Offline).
// Здесь только состояние очереди; отправка — sync/processOutbox.ts.

export interface StartSessionOp {
  type: 'startSession';
  opId: string;
  localId: string;
  workoutId: string;
  programId: string;
  startedAt: string;
}

export interface LogSetOp {
  type: 'logSet';
  opId: string;
  localId: string;
  clientId: string;
  exerciseId: string;
  setNumber: number;
  repsDone: number | null;
  weight: number | null;
  durationSeconds: number | null;
  skipped: boolean;
  notes: string | null;
  loggedAt: string;
  actualCatalogExerciseId: string | null;
}

// Упражнение, добавленное во время тренировки. На устройстве оно сразу
// получает локальный id (localExerciseId) — им подписаны подходы в очереди;
// серверный id приходит в ответе и подменяет локальный при отправке
// (exerciseIds). persist — «каждый раз в этой тренировке», иначе разово.
export interface AddExerciseOp {
  type: 'addExercise';
  opId: string;
  localId: string;
  localExerciseId: string;
  catalogExerciseId: string;
  persist: boolean;
  afterExerciseId: string | null;
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  durationSeconds: number | null;
  restSeconds: number;
}

// Скрыть упражнение, добавленное пользователем (своё, не из программы).
export interface RemoveExerciseOp {
  type: 'removeExercise';
  opId: string;
  localId: string;
  exerciseId: string;
}

export interface UndoSetOp {
  type: 'undoSet';
  opId: string;
  localId: string;
  exerciseId: string;
  setNumber: number;
  targetClientId: string;
}

export interface ReactOp {
  type: 'react';
  opId: string;
  localId: string;
  reaction: ReactionValue;
}

// Пост в ленту по тренировке. Фото — локальные файлы (uri), уходят вместе
// с постом, когда появится сеть.
export interface CreatePostOp {
  type: 'createPost';
  opId: string;
  localId: string;
  title: string;
  photoUris: string[];
}

export interface CompleteOp {
  type: 'complete';
  opId: string;
  localId: string;
  notes: string | null;
}

export interface DiscardOp {
  type: 'discard';
  opId: string;
  localId: string;
}

export type Operation =
  | StartSessionOp
  | LogSetOp
  | AddExerciseOp
  | RemoveExerciseOp
  | UndoSetOp
  | ReactOp
  | CreatePostOp
  | CompleteOp
  | DiscardOp;

export interface DeadOp {
  op: Operation;
  error: string;
}

// «Мёртвые» операции храним только для диагностики — последние N.
const DEAD_OPS_LIMIT = 50;

interface OutboxState {
  ops: Operation[];
  serverIds: Record<string, string>; // localId -> session short_id на сервере
  // Локальный id добавленного упражнения → id на сервере.
  exerciseIds: Record<string, string>;
  deadOps: DeadOp[];
  // Чьи операции в очереди — чтобы не отправить их с токеном другого
  // пользователя после повторного входа (см. auth/services).
  ownerId: string | null;
  paused: boolean;
  enqueue: (op: Operation) => void;
  removeOp: (opId: string) => void;
  setServerId: (localId: string, serverId: string) => void;
  setExerciseId: (localExerciseId: string, serverExerciseId: string) => void;
  // Убирает ещё не отправленные операции сессии и её серверный id.
  forgetSession: (localId: string) => void;
  forgetServerId: (localId: string) => void;
  markDead: (opId: string, error: string) => void;
  // Все операции сессии — в «мёртвые»: без созданной на сервере сессии
  // их некуда отправить.
  markSessionDead: (localId: string, error: string) => void;
  setPaused: (paused: boolean) => void;
  setOwner: (ownerId: string | null) => void;
  reset: () => void;
}

const appendDead = (dead: DeadOp[], extra: DeadOp[]) =>
  [...dead, ...extra].slice(-DEAD_OPS_LIMIT);

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      ops: [],
      serverIds: {},
      exerciseIds: {},
      deadOps: [],
      ownerId: null,
      paused: false,

      enqueue: (op) =>
        set((s) => {
          // Взаимное уничтожение: undoSet отменяет ещё неотправленный logSet
          // на тот же подход — обе операции убираем без похода в сеть.
          if (op.type === 'undoSet') {
            const pending = s.ops.find(
              (o) => o.type === 'logSet' && o.clientId === op.targetClientId,
            );
            if (pending) return { ops: s.ops.filter((o) => o !== pending) };
          }
          // Скрыли упражнение, которое ещё не ушло на сервер, — убираем его
          // создание и всё, что с ним связано, сеть не нужна.
          if (op.type === 'removeExercise') {
            const pendingAdd = s.ops.some(
              (o) =>
                o.type === 'addExercise' && o.localExerciseId === op.exerciseId,
            );
            if (pendingAdd) {
              return {
                ops: s.ops.filter(
                  (o) =>
                    !(
                      (o.type === 'addExercise' &&
                        o.localExerciseId === op.exerciseId) ||
                      ((o.type === 'logSet' || o.type === 'undoSet') &&
                        o.exerciseId === op.exerciseId)
                    ),
                ),
              };
            }
          }
          return { ops: [...s.ops, op] };
        }),

      removeOp: (opId) =>
        set((s) => ({ ops: s.ops.filter((o) => o.opId !== opId) })),

      setServerId: (localId, serverId) =>
        set((s) => ({ serverIds: { ...s.serverIds, [localId]: serverId } })),

      setExerciseId: (localExerciseId, serverExerciseId) =>
        set((s) => ({
          exerciseIds: {
            ...s.exerciseIds,
            [localExerciseId]: serverExerciseId,
          },
        })),

      forgetSession: (localId) =>
        set((s) => ({ ops: s.ops.filter((o) => o.localId !== localId) })),

      forgetServerId: (localId) =>
        set((s) => {
          const { [localId]: _, ...rest } = s.serverIds;
          return { serverIds: rest };
        }),

      markDead: (opId, error) =>
        set((s) => {
          const op = s.ops.find((o) => o.opId === opId);
          if (!op) return s;
          return {
            ops: s.ops.filter((o) => o !== op),
            deadOps: appendDead(s.deadOps, [{ op, error }]),
          };
        }),

      markSessionDead: (localId, error) =>
        set((s) => ({
          ops: s.ops.filter((o) => o.localId !== localId),
          deadOps: appendDead(
            s.deadOps,
            s.ops
              .filter((o) => o.localId === localId)
              .map((op) => ({ op, error })),
          ),
        })),

      setPaused: (paused) => set({ paused }),

      setOwner: (ownerId) => set({ ownerId }),

      reset: () =>
        set({
          ops: [],
          serverIds: {},
          exerciseIds: {},
          deadOps: [],
          ownerId: null,
          paused: false,
        }),
    }),
    {
      name: 'forma.outbox',
      storage: createJSONStorage(() => mmkvStorageAdapter),
      partialize: (state) => ({
        ops: state.ops,
        serverIds: state.serverIds,
        exerciseIds: state.exerciseIds,
        deadOps: state.deadOps,
        ownerId: state.ownerId,
      }),
    },
  ),
);
