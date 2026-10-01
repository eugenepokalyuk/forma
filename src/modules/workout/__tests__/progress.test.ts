import type { Exercise } from '@/modules/programs';

import {
  doneSetsCount,
  isExerciseDone,
  isExerciseFinished,
  isExerciseSkipped,
  stepAfterRest,
  stepToExercise,
} from '../helpers/progress';
import type { LocalLog } from '../store';

const exercise = { id: 'e1', sets: 3 } as Exercise;

const log = (setNumber: number, extra: Partial<LocalLog> = {}): LocalLog => ({
  clientId: `c${setNumber}`,
  exerciseId: 'e1',
  setNumber,
  repsDone: 10,
  weight: 50,
  durationSeconds: null,
  skipped: false,
  loggedAt: '2026-01-01T00:00:00Z',
  notes: null,
  ...extra,
});
const skipMarker = log(0, { skipped: true, repsDone: null, weight: null });

describe('прогресс упражнения', () => {
  it('ещё не начато', () => {
    expect(doneSetsCount(exercise, [])).toBe(0);
    expect(isExerciseDone(exercise, [], 3)).toBe(false);
    expect(isExerciseFinished(exercise, [], 3)).toBe(false);
  });

  it('часть подходов — не выполнено', () => {
    const logs = [log(1), log(2)];
    expect(isExerciseDone(exercise, logs, 3)).toBe(false);
    expect(isExerciseFinished(exercise, logs, 3)).toBe(false);
  });

  it('все подходы — выполнено', () => {
    const logs = [log(1), log(2), log(3)];
    expect(isExerciseDone(exercise, logs, 3)).toBe(true);
    expect(isExerciseFinished(exercise, logs, 3)).toBe(true);
  });

  it('добавленный сверх плана подход тоже нужно сделать', () => {
    expect(isExerciseDone(exercise, [log(1), log(2), log(3)], 4)).toBe(false);
  });

  it('пропущено — закончено, но не выполнено', () => {
    expect(isExerciseSkipped(exercise, [skipMarker])).toBe(true);
    expect(isExerciseFinished(exercise, [skipMarker], 3)).toBe(true);
    expect(isExerciseDone(exercise, [skipMarker], 3)).toBe(false);
  });

  it('подходы другого упражнения не считаются', () => {
    const other = [log(1, { exerciseId: 'e2' }), log(2, { exerciseId: 'e2' })];
    expect(doneSetsCount(exercise, other)).toBe(0);
  });
});

describe('переходы между упражнениями', () => {
  // Три упражнения по 2 подхода.
  const exercises = ['a', 'b', 'c'].map((id) => ({ id, sets: 2 }) as Exercise);
  const totalSetsOf = (ex: Exercise) => ex.sets;
  const sets = (exerciseId: string, count: number) =>
    Array.from({ length: count }, (_, i) =>
      log(i + 1, { exerciseId, clientId: `${exerciseId}${i}` }),
    );
  const skipped = (exerciseId: string) => ({
    ...skipMarker,
    exerciseId,
    clientId: `${exerciseId}-skip`,
  });

  describe('stepToExercise', () => {
    it('незаконченное упражнение — переходим к нему', () => {
      expect(stepToExercise(exercises, [], 1, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 1,
      });
    });

    it('законченные проходим насквозь — выполненные и пропущенные', () => {
      const logs = [...sets('b', 2), skipped('c')];
      expect(stepToExercise(exercises, logs, 1, totalSetsOf)).toEqual({
        kind: 'summary',
      });
      expect(stepToExercise(exercises, sets('a', 2), 0, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 1,
      });
    });

    it('назад на законченное — возвращает вперёд к незаконченному', () => {
      const logs = [...sets('a', 2)];
      expect(stepToExercise(exercises, logs, 0, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 1,
      });
    });

    it('дальше последнего — итог', () => {
      expect(stepToExercise(exercises, [], 3, totalSetsOf)).toEqual({
        kind: 'summary',
      });
    });

    it('добавленный подход делает упражнение снова незаконченным', () => {
      const withExtra = (ex: Exercise) => (ex.id === 'a' ? 3 : ex.sets);
      expect(stepToExercise(exercises, sets('a', 2), 0, withExtra)).toEqual({
        kind: 'exercise',
        index: 0,
      });
    });
  });

  describe('stepAfterRest', () => {
    it('подходы ещё остались — к тому же упражнению', () => {
      expect(stepAfterRest(exercises, sets('a', 1), 0, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 0,
      });
    });

    it('последний подход сделан — к следующему', () => {
      expect(stepAfterRest(exercises, sets('a', 2), 0, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 1,
      });
    });

    it('следующее уже закончено — перескакиваем его', () => {
      const logs = [...sets('a', 2), skipped('b')];
      expect(stepAfterRest(exercises, logs, 0, totalSetsOf)).toEqual({
        kind: 'exercise',
        index: 2,
      });
    });

    it('последнее упражнение закончено — итог', () => {
      expect(stepAfterRest(exercises, sets('c', 2), 2, totalSetsOf)).toEqual({
        kind: 'summary',
      });
    });
  });
});
