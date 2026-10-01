import { formatProgramSubtitle } from '../helpers/formatProgramSubtitle';

describe('formatProgramSubtitle', () => {
  it.each([
    ['gym', 3, 'В зале. 3 раза в неделю'],
    ['home', 2, 'Дома. 2 раза в неделю'],
    ['bars', 5, 'На турниках. 5 раз в неделю'],
  ])('%s, %i в неделю → «%s»', (goal, daysPerWeek, expected) => {
    expect(formatProgramSubtitle({ goal, daysPerWeek })).toBe(expected);
  });

  it('без места или с неизвестным местом — только частота', () => {
    expect(formatProgramSubtitle({ goal: null, daysPerWeek: 1 })).toBe(
      '1 раз в неделю',
    );
    expect(formatProgramSubtitle({ goal: 'pool', daysPerWeek: 4 })).toBe(
      '4 раза в неделю',
    );
  });
});
