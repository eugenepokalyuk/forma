import { formatMMSS, formatNumber, formatTonnage } from '../string/number';
import {
  pluralizeTimes,
  pluralizeWeeks,
  pluralizeWorkouts,
} from '../string/plural';

// ru-RU разделяет разряды неразрывным пробелом — сравниваем без его вида.
const spaces = (s: string) => s.replace(/\s/g, ' ');

describe('formatMMSS', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [600, '10:00'],
    [59.9, '0:59'],
  ])('%s с → %s', (seconds, expected) => {
    expect(formatMMSS(seconds)).toBe(expected);
  });
});

describe('formatNumber', () => {
  it('разряды и округление', () => {
    expect(spaces(formatNumber(214156))).toBe('214 156');
    expect(formatNumber(12.6)).toBe('13');
  });
});

describe('formatTonnage', () => {
  it.each([
    [850, '850 кг'],
    [999, '999 кг'],
    [1000, '1,0 т'],
    [12540, '12,5 т'],
    [99_940, '99,9 т'],
    [154_000, '154 т'],
  ])('%i кг → %s', (kg, expected) => {
    expect(spaces(formatTonnage(kg))).toBe(expected);
  });
});

describe('склонения', () => {
  it.each([
    [1, '1 неделя'],
    [2, '2 недели'],
    [5, '5 недель'],
    [11, '11 недель'],
    [12, '12 недель'],
    [21, '21 неделя'],
    [22, '22 недели'],
    [111, '111 недель'],
  ])('%i → %s', (n, expected) => {
    expect(pluralizeWeeks(n)).toBe(expected);
  });

  it('тренировки и разы', () => {
    expect(pluralizeWorkouts(1)).toBe('1 тренировка');
    expect(pluralizeWorkouts(3)).toBe('3 тренировки');
    expect(pluralizeWorkouts(0)).toBe('0 тренировок');
    expect(pluralizeTimes(2)).toBe('2 раза');
    expect(pluralizeTimes(5)).toBe('5 раз');
  });
});
