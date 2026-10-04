import { isAxiosError } from 'axios';

import { createPostApi, socialKeys } from '@/modules/social';
import { queryClient } from '@/shared/lib/queryClient';

import { addSessionExerciseApi } from '../api/addSessionExerciseApi';
import { completeSessionApi } from '../api/completeSessionApi';
import { discardSessionApi } from '../api/discardSessionApi';
import { logSetApi } from '../api/logSetApi';
import { removeSessionExerciseApi } from '../api/removeSessionExerciseApi';
import { startSessionApi } from '../api/startSessionApi';
import { submitReactionApi } from '../api/submitReactionApi';
import { undoSetApi } from '../api/undoSetApi';
import { useOutboxStore, type Operation } from './outbox';
import { existingPhotos } from './postPhotos';

// Сессия так и не была создана на сервере (startSession ушёл в «мёртвые») —
// операции этой сессии отправить некуда. Очередь строго по порядку, поэтому
// живой startSession всегда обрабатывается раньше своих подходов.
export class ParentLostError extends Error {}

function serverIdOf(localId: string): string {
  const serverId = useOutboxStore.getState().serverIds[localId];
  if (!serverId) throw new ParentLostError();
  return serverId;
}

// Добавленное во время тренировки упражнение подписано в очереди локальным
// id, пока addExercise не вернул серверный (очередь строго по порядку —
// addExercise всегда уходит раньше подходов этого упражнения). Остальные id —
// уже серверные, их не трогаем.
function exerciseIdOf(exerciseId: string): string {
  return useOutboxStore.getState().exerciseIds[exerciseId] ?? exerciseId;
}

function isNotFound(e: unknown) {
  return isAxiosError(e) && e.response?.status === 404;
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
    case 'addExercise': {
      const exercise = await addSessionExerciseApi(serverIdOf(op.localId), {
        catalogExerciseId: op.catalogExerciseId,
        persist: op.persist,
        afterExerciseId: op.afterExerciseId
          ? exerciseIdOf(op.afterExerciseId)
          : null,
        sets: op.sets,
        repsMin: op.repsMin,
        repsMax: op.repsMax,
        durationSeconds: op.durationSeconds,
        restSeconds: op.restSeconds,
      });
      useOutboxStore.getState().setExerciseId(op.localExerciseId, exercise.id);
      return;
    }
    case 'removeExercise':
      await ignoreNotFound(
        removeSessionExerciseApi(
          serverIdOf(op.localId),
          exerciseIdOf(op.exerciseId),
        ),
      );
      return;
    case 'logSet':
      await logSetApi(serverIdOf(op.localId), {
        clientId: op.clientId,
        exerciseId: exerciseIdOf(op.exerciseId),
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
        undoSetApi(
          serverIdOf(op.localId),
          exerciseIdOf(op.exerciseId),
          op.setNumber,
        ),
      );
      return;
    case 'react':
      await submitReactionApi(serverIdOf(op.localId), op.reaction);
      return;
    case 'createPost':
      await createPostApi({
        sessionId: serverIdOf(op.localId),
        title: op.title,
        photoUris: existingPhotos(op.photoUris),
      });
      void queryClient.invalidateQueries({ queryKey: socialKeys.feed });
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
