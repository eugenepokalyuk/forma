import { isAxiosError } from 'axios';

import { reportWarning } from '@/shared/lib/monitoring';

import { useOutboxStore } from './outbox';
import { sweepPhotos } from './postPhotos';
import { ParentLostError, sendOp } from './sendOp';
import { useSyncProgress } from './syncProgress';

const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 5 * 60_000;

let processing = false;
// Очередь строго последовательная — backoff общий для её головы.
let attempt = 0;
let retryAt = 0;

function isUnauthorized(e: unknown) {
  return isAxiosError(e) && e.response?.status === 401;
}

function isRetryable(e: unknown): boolean {
  if (!isAxiosError(e)) return true; // неизвестная ошибка — на всякий случай ретраим
  if (!e.response) return true; // сеть / таймаут
  return e.response.status >= 500;
}

function errorMessage(e: unknown) {
  return isAxiosError(e) ? JSON.stringify(e.response?.data) : String(e);
}

// Отправляет очередь по порядку, пока она не опустеет или не упрётся в
// ошибку. На временной ошибке не ждёт внутри цикла, а выходит и
// откладывает следующую попытку (backoff) — её запустит useOutboxSync:
// таймер, возврат в приложение или появление сети. Последние два
// передают force и пробуют сразу, не дожидаясь backoff.
export async function processOutbox({ force = false } = {}) {
  if (processing) return;
  if (useOutboxStore.getState().paused) return;
  if (!force && Date.now() < retryAt) return;

  processing = true;
  let sent = 0;
  try {
    for (;;) {
      const store = useOutboxStore.getState();
      const op = store.ops[0];
      if (!op) break;
      // Новые операции во время отправки растягивают total, а не сбрасывают.
      useSyncProgress.setState({
        active: true,
        sent,
        total: sent + store.ops.length,
      });

      try {
        await sendOp(op);
        attempt = 0;
        retryAt = 0;
        store.removeOp(op.opId);
        sent += 1;
        if (op.type === 'complete' || op.type === 'discard') {
          store.forgetServerId(op.localId);
        }
      } catch (e) {
        if (isUnauthorized(e)) {
          // Продолжим после повторного входа (см. auth/services).
          store.setPaused(true);
          break;
        }
        if (e instanceof ParentLostError) {
          sent += 1;
          store.markSessionDead(
            op.localId,
            'session was not created on server',
          );
          reportWarning('outbox: session lost', { op: op.type });
          continue;
        }
        if (isRetryable(e)) {
          retryAt =
            Date.now() + Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
          attempt += 1;
          break;
        }
        sent += 1;
        // Прочие 4xx — в «мёртвые», чтобы не блокировать очередь. Если не
        // создалась сама сессия, вместе с ней умирают все её операции.
        if (op.type === 'startSession') {
          store.markSessionDead(op.localId, errorMessage(e));
        } else {
          store.markDead(op.opId, errorMessage(e));
        }
        // Данные пользователя не дошли до сервера — об этом нужно знать.
        reportWarning('outbox: operation rejected', {
          op: op.type,
          error: errorMessage(e),
        });
      }
    }
    sweepPhotos(pendingPhotos());
  } finally {
    processing = false;
    useSyncProgress.setState({ active: false });
  }
}

// Фото постов, которые ещё ждут отправки.
function pendingPhotos() {
  return useOutboxStore
    .getState()
    .ops.flatMap((op) => (op.type === 'createPost' ? op.photoUris : []));
}
