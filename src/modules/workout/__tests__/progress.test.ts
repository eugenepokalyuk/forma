import type { Exercise } from '@/modules/programs';

import {
  doneSetsCount,
  isExerciseDone,
  isExerciseFinished,
  isExerciseSkipped,
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
