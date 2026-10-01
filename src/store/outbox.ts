import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  completeSessionApi,
  discardSessionApi,
  logSetApi,
  startSessionApi,
  undoSetApi,
} from '@/api';
import { mmkvStorageAdapter } from '@/utils/mmkv';

// Очередь синхронизации: во время тренировки источник правды — устройство,
// сервер получает данные из этой очереди, когда появляется сеть. Ни одно
// действие в режиме выполнения не ждёт ответа сети (см. ТЗ, Offline).

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

interface OutboxState {
  ops: Operation[];
  serverIds: Record<string, string>; // localId -> session short_id на сервере
  deadOps: { op: Operation; error: string }[];
  paused: boolean;
  enqueue: (op: Operation) => void;
  setServerId: (localId: string, serverId: string) => void;
  clearSessionOps: (localId: string) => void;
  setPaused: (paused: boolean) => void;
  markDead: (opId: string, error: string) => void;
  removeOp: (opId: string) => void;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set, get) => ({
      ops: [],
      serverIds: {},
      deadOps: [],
      paused: false,

      enqueue: (op) => {
        // Взаимное уничтожение: undoSet отменяет ещё неотправленный logSet
        // на тот же подход — обе операции убираем без похода в сеть.
        if (op.type === 'undoSet') {
          const pendingIndex = get().ops.findIndex(
            (o) => o.type === 'logSet' && o.clientId === op.targetClientId,
          );
          if (pendingIndex !== -1) {
            set({ ops: get().ops.filter((_, i) => i !== pendingIndex) });
            return;
          }
        }
        set({ ops: [...get().ops, op] });
      },

      setServerId: (localId, serverId) => {
        set({ serverIds: { ...get().serverIds, [localId]: serverId } });
      },

      clearSessionOps: (localId) => {
        set({ ops: get().ops.filter((o) => o.localId !== localId) });
      },

      setPaused: (paused) => set({ paused }),

      markDead: (opId, error) => {
        const op = get().ops.find((o) => o.opId === opId);
        set({
          ops: get().ops.filter((o) => o.opId !== opId),
          deadOps: op ? [...get().deadOps, { op, error }] : get().deadOps,
        });
      },

      removeOp: (opId) =>
        set({ ops: get().ops.filter((o) => o.opId !== opId) }),
    }),
    {
      name: 'forma.outbox',
      storage: createJSONStorage(() => mmkvStorageAdapter),
      partialize: (state) => ({
        ops: state.ops,
        serverIds: state.serverIds,
        deadOps: state.deadOps,
      }),
    },
  ),
);

let processing = false;
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 5 * 60_000;
const attemptCounts = new Map<string, number>();

function backoffMs(attempt: number) {
  return Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
}

async function sendOp(op: Operation): Promise<void> {
  const { serverIds, setServerId } = useOutboxStore.getState();

  switch (op.type) {
    case 'startSession': {
      const session = await startSessionApi({
        workoutId: op.workoutId,
        programId: op.programId,
        startedAt: op.startedAt,
      });
      setServerId(op.localId, session.id);
      return;
    }
    case 'logSet': {
      const serverId = serverIds[op.localId];
      if (!serverId) throw new WaitingForParentError();
      await logSetApi(serverId, {
        clientId: op.clientId,
        exerciseId: op.exerciseId,
        setNumber: op.setNumber,
        repsDone: op.repsDone,
        weight: op.weight,
        durationSeconds: op.durationSeconds,
        skipped: op.skipped,
        notes: op.notes,
        loggedAt: op.loggedAt,
        actualCatalogExerciseId: op.actualCatalogExerciseId,
      });
      return;
    }
    case 'undoSet': {
      const serverId = serverIds[op.localId];
      if (!serverId) throw new WaitingForParentError();
      try {
        await undoSetApi(serverId, op.exerciseId, op.setNumber);
      } catch (e) {
        if (!isNotFound(e)) throw e;
      }
      return;
    }
    case 'complete': {
      const serverId = serverIds[op.localId];
      if (!serverId) throw new WaitingForParentError();
      await completeSessionApi(serverId, op.notes);
      return;
    }
    case 'discard': {
      const serverId = serverIds[op.localId];
      if (!serverId) return; // сессия не успела создаться на сервере — нечего удалять
      try {
        await discardSessionApi(serverId);
      } catch (e) {
        if (!isNotFound(e)) throw e;
      }
      return;
    }
  }
}

class WaitingForParentError extends Error {}

function isNotFound(e: unknown) {
  return axios.isAxiosError(e) && e.response?.status === 404;
}

function isRetryable(e: unknown): boolean {
  if (e instanceof WaitingForParentError) return true;
  if (!axios.isAxiosError(e)) return true; // неизвестная ошибка — на всякий случай ретраим
  if (!e.response) return true; // сеть / таймаут
  return e.response.status >= 500;
}

export async function processOutbox() {
  if (processing) return;
  const { paused } = useOutboxStore.getState();
  if (paused) return;

  processing = true;
  try {
    for (;;) {
      const { ops } = useOutboxStore.getState();
      const op = ops[0];
      if (!op) break;

      try {
        await sendOp(op);
        attemptCounts.delete(op.opId);
        useOutboxStore.getState().removeOp(op.opId);
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          useOutboxStore.getState().setPaused(true);
          break;
        }
        if (isRetryable(e)) {
          const attempt = attemptCounts.get(op.opId) ?? 0;
          attemptCounts.set(op.opId, attempt + 1);
          await new Promise((r) => setTimeout(r, backoffMs(attempt)));
          continue; // тот же op — очередь строго по порядку, один процессор
        }
        // Прочие 4xx — в «мёртвые», чтобы не блокировать очередь.
        const message = axios.isAxiosError(e)
          ? JSON.stringify(e.response?.data)
          : String(e);
        useOutboxStore.getState().markDead(op.opId, message);
      }
    }
  } finally {
    processing = false;
  }
}

export function pendingCount() {
  return useOutboxStore.getState().ops.length;
}
