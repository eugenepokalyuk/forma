import { getTimeOfDay } from '../date/timeOfDay';

// Час по UTC → время суток в поясе пользователя.
const utc = (hour: number) => new Date(Date.UTC(2026, 0, 15, hour, 30));

describe('getTimeOfDay', () => {
  it.each([
    [0, 'midnight'],
    [5, 'sunrise'],
    [8, 'morning'],
    [12, 'day'],
    [16, 'noon'],
    [19, 'sunset'],
    [21, 'night'],
  ])('UTC+0, %i:30 → %s', (hour, expected) => {
    expect(getTimeOfDay('UTC+0', utc(hour))).toBe(expected);
  });

  it('смещение пояса: 6:30 UTC в UTC+3 — уже утро', () => {
    expect(getTimeOfDay('UTC+3', utc(6))).toBe('morning');
  });

  it('отрицательное смещение переходит через полночь', () => {
    expect(getTimeOfDay('UTC-5', utc(2))).toBe('night'); // 21:30 накануне
  });

  it('«UTC» без смещения — это UTC+0', () => {
    expect(getTimeOfDay('UTC', utc(10))).toBe('morning'); // при +3 был бы день
  });

  it('нераспознанный пояс — по умолчанию московское время', () => {
    expect(getTimeOfDay('Europe/Moscow', utc(6))).toBe('morning');
  });
});
