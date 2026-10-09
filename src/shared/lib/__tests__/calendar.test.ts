import {
  computeStreak,
  getCurrentWeek,
  getWeek,
  isSameDay,
  weekOffsetOf,
} from '../date/calendar';

// Локальное время: даты строим конструктором, а не ISO-строками,
// чтобы тесты не зависели от часового пояса машины.
const day = (d: number, h = 12) => new Date(2026, 0, d, h);

describe('isSameDay', () => {
  it('один день, разное время', () => {
    expect(isSameDay(day(15, 1), day(15, 23))).toBe(true);
  });

  it('соседние дни', () => {
    expect(isSameDay(day(15, 23), day(16, 0))).toBe(false);
  });

  it('принимает строку', () => {
    expect(isSameDay(day(15), day(15, 8).toISOString())).toBe(true);
  });
});

describe('getCurrentWeek', () => {
  afterEach(() => jest.useRealTimers());

  it('неделя Пн–Вс, в которую попадает сегодня', () => {
    jest.useFakeTimers({ now: day(15) }); // четверг, 15 января 2026
    const week = getCurrentWeek();

    expect(week.map((d) => d.label)).toEqual([
      'Пн',
      'Вт',
      'Ср',
      'Чт',
      'Пт',
      'Сб',
      'Вс',
    ]);
    expect(week.map((d) => d.dayNumber)).toEqual([12, 13, 14, 15, 16, 17, 18]);
    expect(week.filter((d) => d.isToday).map((d) => d.dayNumber)).toEqual([15]);
  });

  it('в воскресенье неделя заканчивается сегодняшним днём', () => {
    jest.useFakeTimers({ now: day(18) });
    const week = getCurrentWeek();

    expect(week[0].dayNumber).toBe(12);
    expect(week[6].isToday).toBe(true);
  });
});

describe('getWeek', () => {
  beforeEach(() => jest.useFakeTimers({ now: day(15) }));
  afterEach(() => jest.useRealTimers());

  it('следующая неделя — без «сегодня»', () => {
    const week = getWeek(1);
    expect(week.map((d) => d.dayNumber)).toEqual([19, 20, 21, 22, 23, 24, 25]);
    expect(week.some((d) => d.isToday)).toBe(false);
  });

  it('прошлая неделя через границу года', () => {
    const week = getWeek(-2);
    expect(week[0].date).toEqual(new Date(2025, 11, 29));
    expect(week[6].date).toEqual(new Date(2026, 0, 4));
  });
});

describe('weekOffsetOf', () => {
  beforeEach(() => jest.useFakeTimers({ now: day(15) }));
  afterEach(() => jest.useRealTimers());

  it('обратное к getWeek', () => {
    expect(weekOffsetOf(day(12, 0))).toBe(0);
    expect(weekOffsetOf(day(18, 23))).toBe(0);
    expect(weekOffsetOf(day(19))).toBe(1);
    expect(weekOffsetOf(day(11))).toBe(-1);
    expect(weekOffsetOf(new Date(2025, 11, 29))).toBe(-2);
  });
});

describe('computeStreak', () => {
  beforeEach(() => jest.useFakeTimers({ now: day(15) }));
  afterEach(() => jest.useRealTimers());

  it('без тренировок — 0', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('подряд до сегодня включительно', () => {
    expect(computeStreak([day(13), day(14), day(15)])).toBe(3);
  });

  it('сегодня ещё не тренировался — серия от вчера не обнуляется', () => {
    expect(computeStreak([day(13), day(14)])).toBe(2);
  });

  it('пропуск вчера и сегодня — серии нет', () => {
    expect(computeStreak([day(12), day(13)])).toBe(0);
  });

  it('разрыв обрывает серию', () => {
    expect(computeStreak([day(11), day(12), day(14), day(15)])).toBe(2);
  });

  it('несколько тренировок в один день считаются одним днём', () => {
    expect(computeStreak([day(15, 8), day(15, 19), day(14)])).toBe(2);
  });
});
