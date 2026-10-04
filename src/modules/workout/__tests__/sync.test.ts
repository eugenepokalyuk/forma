import type { AxiosError } from 'axios';

import type {
  ExerciseCatalogItem,
  WorkoutWithExercises,
} from '@/modules/programs';

// Сценарии очереди синхронизации: сеть, ошибки сервера, смена пользователя.
// API замокан, MMKV — тоже (нативный модуль в jest недоступен).

jest.mock('@/shared/lib/storage/mmkv', () => ({
  mmkvStorageAdapter: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
}));
jest.mock('../services/lastLogs', () => ({
  loadLastLogs: jest.fn(),
  loadLastLogsFor: jest.fn(),
}));
jest.mock('@/shared/lib/monitoring', () => ({ reportWarning: jest.fn() }));

const API = [
  'startSessionApi',
  'addSessionExerciseApi',
  'removeSessionExerciseApi',
  'logSetApi',
  'undoSetApi',
  'submitReactionApi',
  'completeSessionApi',
  'discardSessionApi',
] as const;
type ApiName = (typeof API)[number];

jest.mock('../api/startSessionApi', () => ({ startSessionApi: jest.fn() }));
jest.mock('../api/logSetApi', () => ({ logSetApi: jest.fn() }));
jest.mock('../api/addSessionExerciseApi', () => ({
  addSessionExerciseApi: jest.fn(),
}));
jest.mock('../api/removeSessionExerciseApi', () => ({
  removeSessionExerciseApi: jest.fn(),
}));
jest.mock('../api/undoSetApi', () => ({ undoSetApi: jest.fn() }));
jest.mock('../api/submitReactionApi', () => ({
  submitReactionApi: jest.fn(),
}));
// Пост уходит через API модуля social — подменяем модуль целиком.
jest.mock('@/modules/social', () => ({
  createPostApi: jest.fn(),
  socialKeys: { feed: ['feed'] },
}));
// Файловой системы в jest нет: копии фото — те же uri.
jest.mock('../sync/postPhotos', () => ({
  keepPhotos: (uris: string[]) => uris,
  existingPhotos: (uris: string[]) => uris,
  sweepPhotos: jest.fn(),
}));
jest.mock('@/shared/lib/queryClient', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
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
    createPostApi: jest.Mock;
    sweepPhotos: jest.Mock;
    reportWarning: jest.Mock;
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
      createPostApi: require('@/modules/social').createPostApi,
      sweepPhotos: require('../sync/postPhotos').sweepPhotos,
      reportWarning: require('@/shared/lib/monitoring').reportWarning,
    };
  });
  return mods;
}

const workout = {
  id: 'w1',
  exercises: [
    {
      id: 'e1',
      catalogExerciseId: 'c1',
      exerciseType: 'strength',
      muscles: [],
    },
  ],
} as unknown as WorkoutWithExercises;

const catalogItem = (id: string) =>
  ({
    id,
    name: id,
    description: null,
    additionalInfo: null,
    muscles: [],
    equipmentType: null,
    exerciseType: 'strength',
    videoUrl: null,
    imageUrl: null,
    recommendedReplacementIds: [],
  }) as ExerciseCatalogItem;

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
    // Потерянные данные пользователя уходят в мониторинг.
    expect(m.reportWarning).toHaveBeenCalledWith(
      'outbox: operation rejected',
      expect.objectContaining({ op: 'startSession' }),
    );
    expect(m.reportWarning).toHaveBeenCalledWith('outbox: session lost', {
      op: 'logSet',
    });
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

  it('повторная запись отправленного подхода не создаёт дубль на сервере', async () => {
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    await settle();

    logSet(1);
    await settle();

    expect(ops()).toEqual([]);
    expect(calls()).toEqual([
      'startSessionApi',
      'logSetApi',
      'undoSetApi',
      'logSetApi',
    ]);
    expect(m.session.useSessionStore.getState().active?.logs).toHaveLength(1);
  });

  it('повторная запись неотправленного подхода уходит одним логом', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    logSet(1);
    await settle();

    expect(ops()).toEqual(['startSession', 'logSet']);
  });

  it('оценка и пост уходят до завершения и привязаны к серверной сессии', async () => {
    m.createPostApi.mockResolvedValue({});
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    m.W.completeWorkout({
      notes: 'ок',
      reaction: 'fire',
      post: { title: 'Ноги', photoUris: ['file:///1.jpg'] },
    });
    await settle();

    expect(ops()).toEqual([]);
    expect(m.api.submitReactionApi).toHaveBeenCalledWith('S1', 'fire');
    expect(m.createPostApi).toHaveBeenCalledWith({
      sessionId: 'S1',
      title: 'Ноги',
      photoUris: ['file:///1.jpg'],
    });
    const order = (fn: jest.Mock) => fn.mock.invocationCallOrder[0];
    expect(order(m.api.submitReactionApi)).toBeLessThan(order(m.createPostApi));
    expect(order(m.createPostApi)).toBeLessThan(
      order(m.api.completeSessionApi),
    );
    // Пост ушёл — его фото больше не держим.
    expect(m.sweepPhotos).toHaveBeenLastCalledWith([]);
  });

  it('без сети оценка и пост ждут в очереди вместе с тренировкой', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    m.W.completeWorkout({
      reaction: 'meh',
      post: { title: '', photoUris: ['file:///2.jpg'] },
    });
    await settle();

    expect(ops()).toEqual([
      'startSession',
      'logSet',
      'react',
      'createPost',
      'complete',
    ]);
    // Фото поста в очереди не трогаем, пока он не отправлен.
    expect(m.sweepPhotos).toHaveBeenLastCalledWith(['file:///2.jpg']);
    expect(m.session.useSessionStore.getState().active).toBeNull();
  });

  it('завершение без подходов равносильно отмене', async () => {
    m.W.startWorkout({ programId: 'p1', workout });
    await settle();
    m.W.completeWorkout({ reaction: 'fire' });
    await settle();

    expect(m.api.submitReactionApi).not.toHaveBeenCalled();
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

  it('добавленное офлайн упражнение получает серверный id до своих подходов', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.api.addSessionExerciseApi.mockResolvedValue({ id: 'srv-ex' });
    m.W.startWorkout({ programId: 'p1', workout });
    m.W.addExercise(catalogItem('c2'), false);

    const active = m.session.useSessionStore.getState().active!;
    const added = active.workout.exercises[1];
    expect(active.workout.exercises.map((e) => e.catalogExerciseId)).toEqual([
      'c1',
      'c2',
    ]);
    m.W.logSet({ id: added.id, restSeconds: 60 }, 1, { weight: 10 });
    m.W.undoSet(added.id, 1);
    m.W.logSet({ id: added.id, restSeconds: 60 }, 1, { weight: 20 });
    await settle();
    await m.processOutbox({ force: true });

    expect(ops()).toEqual([]);
    expect(m.api.addSessionExerciseApi).toHaveBeenCalledWith(
      'S1',
      expect.objectContaining({
        catalogExerciseId: 'c2',
        persist: false,
        afterExerciseId: 'e1',
        sets: 3,
      }),
    );
    expect(m.api.logSetApi).toHaveBeenCalledWith(
      'S1',
      expect.objectContaining({ exerciseId: 'srv-ex', weight: 20 }),
    );
  });

  it('подходы заменённого упражнения уходят с фактическим упражнением', async () => {
    m.W.startWorkout({ programId: 'p1', workout });
    logSet(1);
    await settle();
    m.W.replaceExercise('e1', catalogItem('c9'));
    logSet(1);
    await settle();

    const active = m.session.useSessionStore.getState().active!;
    expect(active.workout.exercises[0]).toMatchObject({
      id: 'e1',
      catalogExerciseId: 'c9',
    });
    // Подход прежнего упражнения отменён.
    expect(calls()).toEqual([
      'startSessionApi',
      'logSetApi',
      'undoSetApi',
      'logSetApi',
    ]);
    expect(m.api.logSetApi).toHaveBeenLastCalledWith(
      'S1',
      expect.objectContaining({
        exerciseId: 'e1',
        actualCatalogExerciseId: 'c9',
      }),
    );
  });

  it('скрытое до отправки своё упражнение не ходит в сеть', async () => {
    m.api.startSessionApi.mockRejectedValueOnce(httpError());
    m.W.startWorkout({ programId: 'p1', workout });
    m.W.addExercise(catalogItem('c2'), true);
    const added =
      m.session.useSessionStore.getState().active!.workout.exercises[1];
    m.W.logSet({ id: added.id, restSeconds: 60 }, 1, { weight: 10 });
    m.W.hideExercise(added.id);
    await settle();
    await m.processOutbox({ force: true });

    const active = m.session.useSessionStore.getState().active!;
    expect(active.workout.exercises.map((e) => e.id)).toEqual(['e1']);
    expect(active.logs).toEqual([]);
    expect(ops()).toEqual([]);
    expect(m.api.addSessionExerciseApi).not.toHaveBeenCalled();
    expect(m.api.logSetApi).not.toHaveBeenCalled();
    expect(m.api.removeSessionExerciseApi).not.toHaveBeenCalled();
  });

  it('скрытое своё упражнение отменяет подходы и убирается на сервере', async () => {
    m.api.addSessionExerciseApi.mockResolvedValue({ id: 'srv-ex' });
    m.W.startWorkout({ programId: 'p1', workout });
    m.W.addExercise(catalogItem('c2'), false);
    const added =
      m.session.useSessionStore.getState().active!.workout.exercises[1];
    m.W.logSet({ id: added.id, restSeconds: 60 }, 1, { weight: 10 });
    await settle();
    m.W.hideExercise(added.id);
    await settle();

    expect(calls()).toEqual([
      'startSessionApi',
      'addSessionExerciseApi',
      'logSetApi',
      'undoSetApi',
      'removeSessionExerciseApi',
    ]);
    expect(m.api.removeSessionExerciseApi).toHaveBeenCalledWith('S1', 'srv-ex');
  });

  it('упражнение программы скрыть нельзя', () => {
    m.W.startWorkout({ programId: 'p1', workout });
    m.W.addExercise(catalogItem('c2'), false);
    m.W.hideExercise('e1');
    expect(
      m.session.useSessionStore.getState().active!.workout.exercises,
    ).toHaveLength(2);
  });
});
