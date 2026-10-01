import { formatRelativeTime } from '../date/relativeTime';

const NOW = new Date(2026, 0, 15, 12, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;

describe('formatRelativeTime', () => {
  beforeEach(() => jest.useFakeTimers({ now: NOW }));
  afterEach(() => jest.useRealTimers());

  it.each([
    [30_000, 'только что'],
    [5 * MIN, '5 мин назад'],
    [59 * MIN, '59 мин назад'],
    [60 * MIN, '1 ч назад'],
    [23 * 60 * MIN, '23 ч назад'],
    [24 * 60 * MIN, '1 д назад'],
    [6 * 24 * 60 * MIN, '6 д назад'],
  ])('%i мс назад → «%s»', (ms, expected) => {
    expect(formatRelativeTime(ago(ms))).toBe(expected);
  });

  it('неделя и старше — дата', () => {
    expect(formatRelativeTime(ago(7 * 24 * 60 * MIN))).toMatch(/^8 янв/);
  });
});
