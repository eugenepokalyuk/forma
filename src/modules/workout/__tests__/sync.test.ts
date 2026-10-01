import type { AxiosError } from 'axios';

import type { WorkoutWithExercises } from '@/modules/programs';

// Сценарии очереди синхронизации: сеть, ошибки сервера, смена пользователя.
// API замокан, MMKV — тоже (нативный модуль в jest недоступен).

jest.mock('@/shared/lib/storage/mmkv', () => ({
  mmkvStorageAdapter: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
}));
jest.mock('../services/lastLogs', () => ({ loadLastLogs: jest.fn() }));

const API = [
  'startSessionApi',
  'logSetApi',
  'undoSetApi',
  'completeSessionApi',
  'discardSessionApi',
] as const;
type ApiName = (typeof API)[number];

jest.mock('../api/startSessionApi', () => ({ startSessionApi: jest.fn() }));
jest.mock('../api/logSetApi', () => ({ logSetApi: jest.fn() }));
jest.mock('../api/undoSetApi', () => ({ undoSetApi: jest.fn() }));
jest.mock('../api/completeSessionApi', () => ({
  completeSessionApi: jest.fn(),
}));
jest.mock('../api/discardSessionApi', () => ({
  discardSessionApi: jest.fn(),
}));

function httpError(status?: number): AxiosError {
  return Object.assign(new Error(`http ${status ?? 'network'}`), {
    isAxiosError: true,
    response: status ? { status, data: { detail: status } } : undefined,
  }) as unknown as AxiosError;
}

// Свежие модули на каждый тест: у обработчика очереди есть состояние на
// уровне модуля (флаг обработки, backoff).
function load() {
  let mods!: {
    W: typeof import('../services/workout');
    outbox: typeof import('../sync/outbox');
    processOutbox: typeof import('../sync/processOutbox').processOutbox;
    session: typeof import('../store');
    api: Record<ApiName, jest.Mock>;
  };
  jest.isolateModules(() => {
    const api = Object.fromEntries(
      API.map((name) => [name, require(`../api/${name}`)[name] as jest.Mock]),
    ) as Record<ApiName, jest.Mock>;
    let nextId = 1;
    api.startSessionApi.mockImplementation(async () => ({
      id: `S${nextId++}`,
    }));
    for (const name of API.filter((n) => n !== 'startSessionApi')) {
      api[name].mockResolvedValue({});
    }
    mods = {
      W: require('../services/workout'),
      outbox: require('../sync/outbox'),
      processOutbox: require('../sync/processOutbox').processOutbox,
      session: require('../store'),
      api,
    };
  });
  return mods;
}

const workout = {
  id: 'w1',
  exercises: [{ id: 'e1' }],
} as unknown as WorkoutWithExercises;

const flush = () => new Promise((r) => setTimeout(r, 0));

async function settle() {
  for (let i = 0; i < 10; i++) await flush();
}

describe('очередь синхронизации тренировки', () => {
  let m: ReturnType<typeof load>;
  const ops = () => m.outbox.useOutboxStore.getState().ops.map((o) => o.type);
  const logSet = (setNumber: number) =>
    m.W.logSet({ id: 'e1', restSeconds: 60 }, setNumber, {
      weight: 10,
      repsDone: 5,
    });
  const calls = () =>
    API.flatMap((name) =>
      m.api[name].mock.invocationCallOrder.map((order) => ({ name, order })),
    )
      .sort((a, b) => a.order - b.order)
      .map((c) => c.name);

  beforeEach(() => {
    m = load();
  });

  it('отправляет тренировку по порядку и чистит serverId после завершения', async () => {
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    m.W.completeWorkout();
    await settle();

    expect(ops()).toEqual([]);
    expect(calls()).toEqual([
      'startSessionApi',
      'logSetApi',
      'completeSessionApi',
    ]);
    expect(m.outbox.useOutboxStore.getState().serverIds).toEqual({});
  });

  it('без сети не ждёт внутри цикла, а повторяет по force', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    await settle();
    expect(ops()).toEqual(['startSession']);

    // В окне backoff новые операции не запускают отправку.
    logSet(1);
    await settle();
    expect(m.api.startSessionApi).toHaveBeenCalledTimes(1);

    await m.processOutbox({ force: true });
    expect(ops()).toEqual([]);
    expect(m.api.logSetApi).toHaveBeenCalledTimes(1);
  });

  it('отклонённый startSession не вешает очередь', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError(400));
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    await settle();
    // Сессия уже отклонена сервером, а тренировка на устройстве идёт дальше.
    logSet(2);
    m.W.completeWorkout();
    await settle();

    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    m.W.completeWorkout();
    await settle();

    expect(ops()).toEqual([]);
    const dead = m.outbox.useOutboxStore.getState().deadOps;
    expect(dead.map((d) => d.op.type)).toEqual([
      'startSession',
      'logSet',
      'logSet',
      'complete',
    ]);
    expect(m.api.completeSessionApi).toHaveBeenCalledTimes(1);
  });

  it('отмена неотправленного подхода не ходит в сеть', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    m.W.undoSet('e1', 1);
    await settle();

    expect(ops()).toEqual(['startSession']);
    expect(m.api.logSetApi).not.toHaveBeenCalled();
    expect(m.api.undoSetApi).not.toHaveBeenCalled();
  });

  it('отмена тренировки до создания сессии на сервере', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    await settle();

    m.W.discardWorkout();
    expect(ops()).toEqual(['discard']);

    await m.processOutbox({ force: true });
    expect(ops()).toEqual([]);
    expect(m.api.discardSessionApi).not.toHaveBeenCalled();
  });

  it('после 401 и входа того же пользователя продолжает отправку', async () => {
    m.outbox.useOutboxStore.getState().setOwner('userA');
    m.api.startSessionApi.mockRejectedValueOnce(httpError(401));
    m.W.startWorkout({ programId: 'p1', workout });
    await settle();
    expect(m.outbox.useOutboxStore.getState().paused).toBe(true);

    m.W.adoptWorkoutData('userA');
    await settle();

    expect(ops()).toEqual([]);
    expect(m.session.useSessionStore.getState().active).not.toBeNull();
  });

  it('при входе другим пользователем не отправляет чужую очередь', async () => {
    m.outbox.useOutboxStore.getState().setOwner('userA');
    m.api.startSessionApi.mockRejectedValueOnce(httpError(401));
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    await settle();

    m.W.adoptWorkoutData('userB');
    await settle();

    expect(ops()).toEqual([]);
    expect(m.api.startSessionApi).toHaveBeenCalledTimes(1);
    expect(m.api.logSetApi).not.toHaveBeenCalled();
    expect(m.session.useSessionStore.getState().active).toBeNull();
    expect(m.outbox.useOutboxStore.getState().ownerId).toBe('userB');
  });

  it('завершение без подходов равносильно отмене', async () => {
    m.W.startWorkout({ programId: 'p1', workout });
    await settle();
    m.W.completeWorkout();
    await settle();

    expect(m.api.completeSessionApi).not.toHaveBeenCalled();
    expect(m.api.discardSessionApi).toHaveBeenCalledTimes(1);
  });

  it('сброс при выходе очищает очередь и активную тренировку', () => {
    m.api.startSessionApi.mockRejectedValue(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    expect(m.W.getPendingSyncCount()).toBeGreaterThan(0);

    m.W.resetWorkoutData();

    expect(m.W.getPendingSyncCount()).toBe(0);
    expect(m.session.useSessionStore.getState().active).toBeNull();
  });
});
