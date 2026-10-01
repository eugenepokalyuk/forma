import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

export interface UndoSetOp {
  type: 'undoSet';
  opId: string;
  localId: string;
  exerciseId: string;
  setNumber: number;
  targetClientId: string;
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
  StartSessionOp | LogSetOp | UndoSetOp | CompleteOp | DiscardOp;

export interface DeadOp {
  op: Operation;
  error: string;
}

// «Мёртвые» операции храним только для диагностики — последние N.
const DEAD_OPS_LIMIT = 50;

interface OutboxState {
  ops: Operation[];
  serverIds: Record<string, string>; // localId -> session short_id на сервере
  deadOps: DeadOp[];
  // Чьи операции в очереди — чтобы не отправить их с токеном другого
  // пользователя после повторного входа (см. auth/services).
  ownerId: string | null;
  paused: boolean;
  enqueue: (op: Operation) => void;
  removeOp: (opId: string) => void;
  setServerId: (localId: string, serverId: string) => void;
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
          return { ops: [...s.ops, op] };
        }),

      removeOp: (opId) =>
        set((s) => ({ ops: s.ops.filter((o) => o.opId !== opId) })),

      setServerId: (localId, serverId) =>
        set((s) => ({ serverIds: { ...s.serverIds, [localId]: serverId } })),

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
        deadOps: state.deadOps,
        ownerId: state.ownerId,
      }),
    },
  ),
);
