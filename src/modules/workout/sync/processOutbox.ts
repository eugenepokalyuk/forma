import axios from 'axios';

import { useOutboxStore } from './outbox';
import { ParentLostError, sendOp } from './sendOp';

const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 5 * 60_000;

let processing = false;
// Очередь строго последовательная — backoff общий для её головы.
let attempt = 0;
let retryAt = 0;

function isUnauthorized(e: unknown) {
  return axios.isAxiosError(e) && e.response?.status === 401;
}

function isRetryable(e: unknown): boolean {
  if (!axios.isAxiosError(e)) return true; // неизвестная ошибка — на всякий случай ретраим
  if (!e.response) return true; // сеть / таймаут
  return e.response.status >= 500;
}

function errorMessage(e: unknown) {
  return axios.isAxiosError(e) ? JSON.stringify(e.response?.data) : String(e);
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
  try {
    for (;;) {
      const store = useOutboxStore.getState();
      const op = store.ops[0];
      if (!op) break;

      try {
        await sendOp(op);
        attempt = 0;
        retryAt = 0;
        store.removeOp(op.opId);
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
          store.markSessionDead(
            op.localId,
            'session was not created on server',
          );
          continue;
        }
        if (isRetryable(e)) {
          retryAt =
            Date.now() + Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
          attempt += 1;
          break;
        }
        // Прочие 4xx — в «мёртвые», чтобы не блокировать очередь. Если не
        // создалась сама сессия, вместе с ней умирают все её операции.
        if (op.type === 'startSession') {
          store.markSessionDead(op.localId, errorMessage(e));
        } else {
          store.markDead(op.opId, errorMessage(e));
        }
      }
    }
  } finally {
    processing = false;
  }
}
