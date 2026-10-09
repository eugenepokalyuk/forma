import { sessionExerciseResults, sessionsOnDay } from '../helpers/sessionDay';
import type { ExerciseLog, SessionWithWorkout } from '../models/session';

// Локальное время: даты строим конструктором, чтобы тесты не зависели от
// часового пояса машины.
const at = (d: number, h: number) => new Date(2026, 0, d, h).toISOString();

const session = (extra: Partial<SessionWithWorkout>): SessionWithWorkout =>
  ({
    id: 's',
    workoutId: 'w1',
    programId: 'p1',
    status: 'completed',
    startedAt: at(15, 10),
    completedAt: at(15, 11),
    exerciseLogs: [],
    workout: { exercises: [] },
    ...extra,
  }) as unknown as SessionWithWorkout;

const log = (exerciseId: string, extra: Partial<ExerciseLog> = {}) =>
  ({ exerciseId, skipped: false, ...extra }) as ExerciseLog;

describe('sessionsOnDay', () => {
  it('завершённая — по дню завершения, после полуночи', () => {
    const late = session({ startedAt: at(14, 23), completedAt: at(15, 0) });
    expect(sessionsOnDay([late], new Date(2026, 0, 15))).toEqual([late]);
    expect(sessionsOnDay([late], new Date(2026, 0, 14))).toEqual([]);
  });

  it('незавершённая — по дню старта', () => {
    const open = session({
      status: 'in_progress',
      startedAt: at(14, 20),
      completedAt: null,
    });
    expect(sessionsOnDay([open], new Date(2026, 0, 14))).toEqual([open]);
  });

  it('по порядку начала', () => {
    const evening = session({ id: 'b', startedAt: at(15, 19) });
    const morning = session({ id: 'a', startedAt: at(15, 8) });
    expect(
      sessionsOnDay([evening, morning], new Date(2026, 0, 15)).map((s) => s.id),
    ).toEqual(['a', 'b']);
  });
});

describe('sessionExerciseResults', () => {
  it('подходы и пропуски по упражнениям', () => {
    const s = session({
      workout: {
        exercises: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }],
      } as SessionWithWorkout['workout'],
      exerciseLogs: [log('e1'), log('e1'), log('e2', { skipped: true })],
    });

    expect(
      sessionExerciseResults(s).map(({ exercise, setsDone, skipped }) => [
        exercise.id,
        setsDone,
        skipped,
      ]),
    ).toEqual([
      ['e1', 2, false],
      ['e2', 0, true],
      ['e3', 0, false],
    ]);
  });
});
