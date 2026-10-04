import type {
  ExerciseCatalogItem,
  ReactionValue,
  WorkoutWithExercises,
} from '@/modules/programs';
import { uuid } from '@/shared/lib/uuid';

import {
  exerciseFromCatalog,
  replaceWithCatalog,
} from '../helpers/exercisePicker';
import { useSessionStore, type ActiveSession, type LocalLog } from '../store';
import { useOutboxStore, type LogSetOp, type Operation } from '../sync/outbox';
import { keepPhotos, sweepPhotos } from '../sync/postPhotos';
import { processOutbox } from '../sync/processOutbox';
import { loadLastLogs, loadLastLogsFor } from './lastLogs';

// Сценарии тренировки: меняют локальное состояние сразу и ставят операцию
// в очередь синхронизации — ни один не ждёт сети.

type WithoutOpId<T> = T extends unknown ? Omit<T, 'opId'> : never;

function enqueue(op: WithoutOpId<Operation>) {
  useOutboxStore.getState().enqueue({ ...op, opId: uuid() } as Operation);
  void processOutbox();
}

// Подход заменённого упражнения записывается в фактическое (см. ActiveSession.
// replacedCatalogIds), иначе — в упражнение плана (null).
function logSetOp(
  active: ActiveSession,
  entry: LocalLog,
): Omit<LogSetOp, 'opId'> {
  return {
    type: 'logSet',
    localId: active.localId,
    clientId: entry.clientId,
    exerciseId: entry.exerciseId,
    setNumber: entry.setNumber,
    repsDone: entry.repsDone,
    weight: entry.weight,
    durationSeconds: entry.durationSeconds,
    skipped: entry.skipped,
    notes: entry.notes,
    loggedAt: entry.loggedAt,
    actualCatalogExerciseId:
      active.replacedCatalogIds?.[entry.exerciseId] ?? null,
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
  enqueue(logSetOp(session.active, entry));
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
  enqueue(logSetOp(session.active, entry));
}

// Замена упражнения — только на эту тренировку: на месте меняется описание,
// план остаётся (см. replaceWithCatalog). Уже записанные подходы и пропуск
// этого упражнения отменяются — они относились к прежнему упражнению
// (подтверждение — на экране).
export function replaceExercise(exerciseId: string, item: ExerciseCatalogItem) {
  const session = useSessionStore.getState();
  const exercise = session.active?.workout.exercises.find(
    (e) => e.id === exerciseId,
  );
  if (!session.active || !exercise) return;

  for (const log of session.active.logs.filter(
    (l) => l.exerciseId === exerciseId,
  )) {
    undoSet(exerciseId, log.setNumber);
  }
  session.replaceExercise(replaceWithCatalog(exercise, item), item.id);
  loadLastLogsFor([item.id]);
}

// Новое упражнение сразу после текущего. На устройстве появляется сразу, с
// локальным id; на сервер уходит из очереди (persist — «каждый раз в этой
// тренировке», иначе только сегодня).
export function addExercise(item: ExerciseCatalogItem, persist: boolean) {
  const session = useSessionStore.getState();
  const active = session.active;
  if (!active) return;

  const anchor = active.workout.exercises[active.currentExerciseIndex];
  const exercise = exerciseFromCatalog(
    item,
    uuid(),
    (anchor?.orderIndex ?? 0) + 1,
  );
  session.insertExercise(active.currentExerciseIndex, exercise);
  enqueue({
    type: 'addExercise',
    localId: active.localId,
    localExerciseId: exercise.id,
    catalogExerciseId: item.id,
    persist,
    afterExerciseId: anchor?.id ?? null,
    sets: exercise.sets,
    repsMin: exercise.repsMin,
    repsMax: exercise.repsMax,
    durationSeconds: exercise.durationSeconds,
    restSeconds: exercise.restSeconds,
  });
  loadLastLogsFor([item.id]);
}

// Скрыть своё упражнение (isCustom) — разовое или «каждый раз». Его подходы
// отменяем: они ушли бы на сервер вместе с упражнением, которого больше нет.
// Последнее упражнение тренировки не убираем — тренировка опустела бы.
export function hideExercise(exerciseId: string) {
  const session = useSessionStore.getState();
  const active = session.active;
  const exercise = active?.workout.exercises.find((e) => e.id === exerciseId);
  if (!active || !exercise?.isCustom || active.workout.exercises.length < 2)
    return;

  for (const log of active.logs.filter((l) => l.exerciseId === exerciseId)) {
    undoSet(exerciseId, log.setNumber);
  }
  session.removeExercise(exerciseId);
  enqueue({ type: 'removeExercise', localId: active.localId, exerciseId });
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
