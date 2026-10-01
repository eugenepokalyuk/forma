import type { Exercise } from '@/modules/programs';

import {
  formatSetsLine,
  formatTarget,
  formatTargetLabel,
  isTimedExercise,
} from '../helpers/format';
import { getPrefill } from '../helpers/setPrefill';
import { tonnage } from '../helpers/tonnage';
import type { LocalLog } from '../store';

const exercise = (extra: Partial<Exercise>): Exercise =>
  ({
    id: 'e1',
    exerciseType: 'strength',
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    durationSeconds: null,
    ...extra,
  }) as Exercise;

const log = (extra: Partial<LocalLog>): LocalLog => ({
  clientId: 'c',
  exerciseId: 'e1',
  setNumber: 1,
  repsDone: null,
  weight: null,
  durationSeconds: null,
  skipped: false,
  loggedAt: '2026-01-01T00:00:00Z',
  notes: null,
  ...extra,
});

describe('isTimedExercise', () => {
  it.each([
    ['cardio', true],
    ['stretch', true],
    ['yoga', true],
    ['strength', false],
    ['bodyweight', false],
  ] as const)('%s → %s', (exerciseType, expected) => {
    expect(isTimedExercise(exercise({ exerciseType }))).toBe(expected);
  });
});

describe('formatTarget / formatTargetLabel', () => {
  it('диапазон повторов', () => {
    expect(formatTarget(exercise({}))).toBe('8–12');
    expect(formatTargetLabel(exercise({}))).toBe('8–12 повторов');
  });

  it.each([
    [1, '1 повтор'],
    [2, '2 повтора'],
    [5, '5 повторов'],
    [21, '21 повтор'],
  ])('одно число %i → «%s»', (reps, expected) => {
    expect(formatTargetLabel(exercise({ repsMin: reps, repsMax: reps }))).toBe(
      expected,
    );
  });

  it('слово согласуется с последним числом диапазона', () => {
    expect(formatTargetLabel(exercise({ repsMin: 2, repsMax: 4 }))).toBe(
      '2–4 повтора',
    );
  });

  it('известна только одна граница', () => {
    expect(formatTarget(exercise({ repsMin: 10, repsMax: null }))).toBe('10');
    expect(formatTarget(exercise({ repsMin: null, repsMax: 15 }))).toBe('15');
  });

  it('цель не задана', () => {
    expect(formatTargetLabel(exercise({ repsMin: null, repsMax: null }))).toBe(
      '—',
    );
  });

  it('на время: ровные минуты — «N мин», иначе мм:сс', () => {
    expect(
      formatTargetLabel(
        exercise({ exerciseType: 'cardio', durationSeconds: 300 }),
      ),
    ).toBe('5 мин');
    expect(
      formatTarget(exercise({ exerciseType: 'yoga', durationSeconds: 90 })),
    ).toBe('1:30');
  });
});

describe('formatSetsLine', () => {
  it('подходы × цель', () => {
    expect(formatSetsLine(exercise({}))).toBe('3 × 8–12');
  });

  it('один подход на время — без «1 ×»', () => {
    expect(
      formatSetsLine(
        exercise({ exerciseType: 'cardio', sets: 1, durationSeconds: 600 }),
      ),
    ).toBe('10 мин');
  });
});

describe('getPrefill', () => {
  const ex = exercise({ repsMin: 8, repsMax: 12 });

  it('сначала — предыдущий подход этой тренировки', () => {
    const logs = [log({ setNumber: 1, weight: 50, repsDone: 10 })];
    expect(getPrefill(ex, 2, logs, undefined)).toEqual({
      weight: 50,
      reps: 10,
    });
  });

  it('затем — прошлый раз для того же номера подхода', () => {
    const lastLogs = [
      { setNumber: 1, weight: 40, repsDone: 12 },
      { setNumber: 2, weight: 45, repsDone: 10 },
    ].map((l) => ({
      ...l,
      sessionId: 's',
      sessionDate: '2026-01-01',
      durationSeconds: null,
    }));
    expect(getPrefill(ex, 2, [], lastLogs)).toEqual({ weight: 45, reps: 10 });
  });

  it('без истории — 0 кг и верхняя граница цели', () => {
    expect(getPrefill(ex, 1, [], undefined)).toEqual({ weight: 0, reps: 12 });
  });

  it('подход другого упражнения не учитывается', () => {
    const logs = [log({ exerciseId: 'e2', setNumber: 1, weight: 99 })];
    expect(getPrefill(ex, 2, logs, undefined).weight).toBe(0);
  });
});

describe('tonnage', () => {
  it('сумма вес × повторы, пустые значения — ноль', () => {
    expect(
      tonnage([
        log({ weight: 50, repsDone: 10 }),
        log({ weight: 60, repsDone: 8 }),
        log({ weight: null, repsDone: 12 }),
        log({ durationSeconds: 300 }),
      ]),
    ).toBe(980);
  });
});
