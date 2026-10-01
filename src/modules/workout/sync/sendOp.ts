import axios from 'axios';

import { completeSessionApi } from '../api/completeSessionApi';
import { discardSessionApi } from '../api/discardSessionApi';
import { logSetApi } from '../api/logSetApi';
import { startSessionApi } from '../api/startSessionApi';
import { undoSetApi } from '../api/undoSetApi';
import { useOutboxStore, type Operation } from './outbox';

// Сессия так и не была создана на сервере (startSession ушёл в «мёртвые») —
// операции этой сессии отправить некуда. Очередь строго по порядку, поэтому
// живой startSession всегда обрабатывается раньше своих подходов.
export class ParentLostError extends Error {}

function serverIdOf(localId: string): string {
  const serverId = useOutboxStore.getState().serverIds[localId];
  if (!serverId) throw new ParentLostError();
  return serverId;
}

function isNotFound(e: unknown) {
  return axios.isAxiosError(e) && e.response?.status === 404;
}

// 404 на удалении — цель уже удалена, считаем операцию выполненной.
async function ignoreNotFound(request: Promise<unknown>) {
  try {
    await request;
  } catch (e) {
    if (!isNotFound(e)) throw e;
  }
}

export async function sendOp(op: Operation): Promise<void> {
  switch (op.type) {
    case 'startSession': {
      const session = await startSessionApi({
        workoutId: op.workoutId,
        programId: op.programId,
        startedAt: op.startedAt,
      });
      useOutboxStore.getState().setServerId(op.localId, session.id);
      return;
    }
    case 'logSet':
      await logSetApi(serverIdOf(op.localId), {
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
    case 'undoSet':
      await ignoreNotFound(
        undoSetApi(serverIdOf(op.localId), op.exerciseId, op.setNumber),
      );
      return;
    case 'complete':
      await completeSessionApi(serverIdOf(op.localId), op.notes);
      return;
    case 'discard': {
      const serverId = useOutboxStore.getState().serverIds[op.localId];
      if (!serverId) return; // сессия не успела создаться на сервере — нечего удалять
      await ignoreNotFound(discardSessionApi(serverId));
      return;
    }
  }
}
