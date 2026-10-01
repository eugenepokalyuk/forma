import { formatLastLog } from '../helpers/format';
import { lastLogForSet } from '../helpers/setPrefill';
import type { LastLog } from '../models/session';

const log = (extra: Partial<LastLog>): LastLog => ({
  sessionId: 's1',
  sessionDate: '2026-01-01',
  setNumber: 1,
  weight: null,
  repsDone: null,
  durationSeconds: null,
  ...extra,
});

describe('formatLastLog', () => {
  it('вес и повторы', () => {
    expect(formatLastLog(log({ weight: 40, repsDone: 10 }))).toBe('40 кг × 10');
  });

  it('дробный вес не округляется', () => {
    expect(formatLastLog(log({ weight: 42.5, repsDone: 8 }))).toBe(
      '42.5 кг × 8',
    );
  });

  it('свой вес — только повторы', () => {
    expect(formatLastLog(log({ weight: 0, repsDone: 12 }))).toBe('12 повт.');
  });

  it('вес без повторов', () => {
    expect(formatLastLog(log({ weight: 20 }))).toBe('20 кг');
  });

  it('упражнение на время', () => {
    expect(formatLastLog(log({ durationSeconds: 300 }))).toBe('5:00');
  });
});

describe('lastLogForSet', () => {
  const logs = [log({ setNumber: 1 }), log({ setNumber: 2, weight: 50 })];

  it('тот же номер подхода', () => {
    expect(lastLogForSet(logs, 2)?.weight).toBe(50);
  });

  it('если такого подхода не было — первый', () => {
    expect(lastLogForSet(logs, 5)?.setNumber).toBe(1);
  });

  it('без истории — ничего', () => {
    expect(lastLogForSet(undefined, 1)).toBeUndefined();
  });
});
