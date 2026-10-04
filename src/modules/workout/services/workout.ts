import type { ReactionValue, WorkoutWithExercises } from '@/modules/programs';
import { uuid } from '@/shared/lib/uuid';

import { useSessionStore, type LocalLog } from '../store';
import { useOutboxStore, type LogSetOp, type Operation } from '../sync/outbox';
import { keepPhotos, sweepPhotos } from '../sync/postPhotos';
import { processOutbox } from '../sync/processOutbox';
import { loadLastLogs } from './lastLogs';

// Сценарии тренировки: меняют локальное состояние сразу и ставят операцию
// в очередь синхронизации — ни один не ждёт сети.

type WithoutOpId<T> = T extends unknown ? Omit<T, 'opId'> : never;

function enqueue(op: WithoutOpId<Operation>) {
  useOutboxStore.getState().enqueue({ ...op, opId: uuid() } as Operation);
  void processOutbox();
}

function logSetOp(localId: string, entry: LocalLog): Omit<LogSetOp, 'opId'> {
  return {
    type: 'logSet',
    localId,
    clientId: entry.clientId,
    exerciseId: entry.exerciseId,
    setNumber: entry.setNumber,
    repsDone: entry.repsDone,
    weight: entry.weight,
    durationSeconds: entry.durationSeconds,
    skipped: entry.skipped,
    notes: entry.notes,
    loggedAt: entry.loggedAt,
    actualCatalogExerciseId: null,
  };
}

export function startWorkout({
  programId,
  workout,
}: {
  programId: string;
  workout: WorkoutWithExercises;
}) {
  const localId = uuid();
  const startedAt = new Date().toISOString();

  useSessionStore.getState().begin({
    localId,
    programId,
    workoutId: workout.id,
    workout,
    startedAt,
    currentExerciseIndex: 0,
    logs: [],
    restEndsAt: null,
    restForExerciseId: null,
    lastLogs: {},
  });
  enqueue({
    type: 'startSession',
    localId,
    workoutId: workout.id,
    programId,
    startedAt,
  });
  loadLastLogs(workout);
}

export interface SetValues {
  repsDone?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  notes?: string | null;
}

export function logSet(
  exercise: { id: string; restSeconds: number },
  setNumber: number,
  values: SetValues,
) {
  const session = useSessionStore.getState();
  if (!session.active) return;

  // Подход с этим номером уже записан — сначала отменяем его и на сервере:
  // бэкенд дедуплицирует только по clientId, и новый лог того же подхода
  // иначе лёг бы рядом со старым.
  const previous = session.active.logs.find(
    (l) =>
      l.exerciseId === exercise.id && l.setNumber === setNumber && !l.skipped,
  );
  if (previous) undoSet(exercise.id, setNumber);

  const entry: LocalLog = {
    clientId: uuid(),
    exerciseId: exercise.id,
    setNumber,
    repsDone: values.repsDone ?? null,
    weight: values.weight ?? null,
    durationSeconds: values.durationSeconds ?? null,
    skipped: false,
    loggedAt: new Date().toISOString(),
    notes: values.notes ?? null,
  };
  session.upsertLog(entry);
  session.startRest(exercise.id, exercise.restSeconds);
  enqueue(logSetOp(session.active.localId, entry));
}

// Пропуск упражнения целиком — один маркер-лог (setNumber: 0, skipped:
// true) вместо отметки каждого подхода, так же как на сайте
// (sessionSlice.skipExercise). В тоннаж/статистику такой лог не входит.
export function skipExercise(exerciseId: string) {
  const session = useSessionStore.getState();
  if (!session.active) return;

  const entry: LocalLog = {
    clientId: uuid(),
    exerciseId,
    setNumber: 0,
    repsDone: null,
    weight: null,
    durationSeconds: null,
    skipped: true,
    loggedAt: new Date().toISOString(),
    notes: null,
  };
  session.appendLog(entry);
  enqueue(logSetOp(session.active.localId, entry));
}

export function undoSet(exerciseId: string, setNumber: number) {
  const session = useSessionStore.getState();
  const target = session.active?.logs.find(
    (l) => l.exerciseId === exerciseId && l.setNumber === setNumber,
  );
  if (!session.active || !target) return;

  session.removeLog(target.clientId);
  enqueue({
    type: 'undoSet',
    localId: session.active.localId,
    exerciseId,
    setNumber,
    targetClientId: target.clientId,
  });
}

export interface WorkoutFinish {
  notes?: string;
  reaction?: ReactionValue | null;
  post?: { title: string; photoUris: string[] } | null;
}

// Тренировка без единого подхода не сохраняется — равносильна отмене.
// Оценка и пост встают в очередь до завершения: после него очередь
// забывает серверный id сессии, и привязать их было бы не к чему.
export function completeWorkout({ notes, reaction, post }: WorkoutFinish = {}) {
  const { active, end } = useSessionStore.getState();
  if (!active) return;
  if (active.logs.length === 0) {
    discardWorkout();
    return;
  }

  const { localId } = active;
  end();
  if (reaction) enqueue({ type: 'react', localId, reaction });
  if (post) {
    enqueue({
      type: 'createPost',
      localId,
      title: post.title,
      photoUris: keepPhotos(post.photoUris),
    });
  }
  enqueue({ type: 'complete', localId, notes: notes ?? null });
}

export function discardWorkout() {
  const { active, end } = useSessionStore.getState();
  if (!active) return;
  end();
  // Неотправленные операции сессии не нужны — на сервер уходит только
  // удаление, если сессия там уже успела создаться.
  useOutboxStore.getState().forgetSession(active.localId);
  enqueue({ type: 'discard', localId: active.localId });
}

export function getPendingSyncCount() {
  return useOutboxStore.getState().ops.length;
}

// Вход пользователя: очередь чужого аккаунта (остаток после истёкшей
// сессии) не отправляем с его токеном — сбрасываем вместе с тренировкой.
export function adoptWorkoutData(userId: string) {
  const outbox = useOutboxStore.getState();
  if (outbox.ownerId && outbox.ownerId !== userId) {
    resetWorkoutData();
  }
  useOutboxStore.getState().setOwner(userId);
  useOutboxStore.getState().setPaused(false);
  void processOutbox({ force: true });
}

// Гость вошёл в существующий аккаунт: сервер перенёс его сессии и подходы
// в аккаунт с теми же id, поэтому очередь и активная тренировка остаются —
// меняется только владелец. Пауза — пока идёт перенос, чтобы запрос со
// старым токеном не получил 401.
export function pauseWorkoutSync(paused: boolean) {
  useOutboxStore.getState().setPaused(paused);
}

export function transferWorkoutData(userId: string) {
  useOutboxStore.getState().setOwner(userId);
}

// Выход из аккаунта: локальные данные тренировок больше не нужны.
export function resetWorkoutData() {
  useSessionStore.getState().end();
  useOutboxStore.getState().reset();
  sweepPhotos([]);
}
