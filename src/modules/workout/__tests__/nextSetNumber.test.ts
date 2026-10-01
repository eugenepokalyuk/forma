import { nextSetNumber } from '../helpers/nextSetNumber';
import type { LocalLog } from '../store';

const log = (setNumber: number, extra: Partial<LocalLog> = {}): LocalLog => ({
  clientId: `c${setNumber}`,
  exerciseId: 'e1',
  setNumber,
  repsDone: 5,
  weight: 10,
  durationSeconds: null,
  skipped: false,
  loggedAt: '2026-01-01T00:00:00Z',
  notes: null,
  ...extra,
});

describe('nextSetNumber', () => {
  it('первый подход — 1', () => {
    expect(nextSetNumber('e1', [])).toBe(1);
  });

  it('следующий после сделанных подряд', () => {
    expect(nextSetNumber('e1', [log(1), log(2)])).toBe(3);
  });

  it('после отмены подхода из середины — освободившийся номер', () => {
    expect(nextSetNumber('e1', [log(1), log(3)])).toBe(2);
  });

  it('не учитывает другие упражнения и маркер пропуска', () => {
    expect(
      nextSetNumber('e1', [
        log(1, { exerciseId: 'e2' }),
        log(0, { skipped: true }),
      ]),
    ).toBe(1);
  });
});
