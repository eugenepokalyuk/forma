import { getNextWorkout, getProgramProgress } from '../helpers/nextWorkout';
import type { Session } from '../models/session';

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

const session = (extra: Partial<Session>): Session =>
  ({
    id: 's',
    workoutId: 'w1',
    programId: 'p1',
    status: 'completed',
    startedAt: daysAgo(1),
    completedAt: daysAgo(1),
    exerciseLogs: [],
    ...extra,
  }) as Session;

const workouts = [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }];

describe('getNextWorkout', () => {
  it('программа без тренировок', () => {
    expect(getNextWorkout([], [], 'p1')).toBeNull();
  });

  it('ещё не тренировался — первая', () => {
    expect(getNextWorkout(workouts, [], 'p1')?.id).toBe('w1');
  });

  it('следующая после последней завершённой', () => {
    const history = [
      session({ workoutId: 'w1', startedAt: daysAgo(3) }),
      session({ workoutId: 'w2', startedAt: daysAgo(1) }),
    ];
    expect(getNextWorkout(workouts, history, 'p1')?.id).toBe('w3');
  });

  it('после последней — по кругу на первую', () => {
    expect(
      getNextWorkout(workouts, [session({ workoutId: 'w3' })], 'p1')?.id,
    ).toBe('w1');
  });

  it('другие программы и незавершённые сессии не учитываются', () => {
    const history = [
      session({ workoutId: 'w2', programId: 'p2' }),
      session({ workoutId: 'w2', status: 'in_progress' }),
    ];
    expect(getNextWorkout(workouts, history, 'p1')?.id).toBe('w1');
  });

  it('тренировка удалена из программы — с начала', () => {
    expect(
      getNextWorkout(workouts, [session({ workoutId: 'gone' })], 'p1')?.id,
    ).toBe('w1');
  });
});

describe('getProgramProgress', () => {
  it('ещё не тренировался — первая текущая, пройденных нет', () => {
    const { current, doneIds } = getProgramProgress(workouts, [], 'p1');
    expect(current?.id).toBe('w1');
    expect([...doneIds]).toEqual([]);
  });

  it('пройденные — завершённые до текущей', () => {
    const history = [
      session({ workoutId: 'w1', startedAt: daysAgo(3) }),
      session({ workoutId: 'w2', startedAt: daysAgo(1) }),
    ];
    const { current, doneIds } = getProgramProgress(workouts, history, 'p1');
    expect(current?.id).toBe('w3');
    expect([...doneIds]).toEqual(['w1', 'w2']);
  });

  it('пропущенный день не отмечается пройденным', () => {
    const { current, doneIds } = getProgramProgress(
      workouts,
      [session({ workoutId: 'w2' })],
      'p1',
    );
    expect(current?.id).toBe('w3');
    expect([...doneIds]).toEqual(['w2']);
  });

  it('новый круг — отметки сброшены', () => {
    const history = [
      session({ workoutId: 'w1', startedAt: daysAgo(5) }),
      session({ workoutId: 'w2', startedAt: daysAgo(3) }),
      session({ workoutId: 'w3', startedAt: daysAgo(1) }),
    ];
    const { current, doneIds } = getProgramProgress(workouts, history, 'p1');
    expect(current?.id).toBe('w1');
    expect([...doneIds]).toEqual([]);
  });
});
