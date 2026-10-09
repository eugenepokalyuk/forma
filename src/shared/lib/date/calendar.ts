const WEEKDAY_LETTERS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export interface WeekDay {
  date: Date;
  label: string;
  dayNumber: number;
  isToday: boolean;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Понедельник недели, в которую попадает дата.
function mondayOf(date: Date): Date {
  const monday = startOfDay(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

// Неделя Пн–Вс со сдвигом от текущей: 0 — эта, -1 — прошлая, 1 — следующая.
// Неделя целиком (а не «сегодня плюс 6 дней вперёд») — так пользователь
// сразу видит, сколько дней уже тренировался на этой неделе.
export function getWeek(offset: number): WeekDay[] {
  const today = startOfDay(new Date());
  const monday = mondayOf(today);
  monday.setDate(monday.getDate() + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      date,
      label: WEEKDAY_LETTERS[i],
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
    };
  });
}

export function getCurrentWeek(): WeekDay[] {
  return getWeek(0);
}

// Сдвиг недели даты относительно текущей (обратное к getWeek).
export function weekOffsetOf(date: Date): number {
  const diff = mondayOf(date).getTime() - mondayOf(new Date()).getTime();
  // Округление гасит час перехода на летнее/зимнее время.
  return Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function isSameDay(a: Date, b: string | Date): boolean {
  const bDate = typeof b === 'string' ? new Date(b) : b;
  return (
    a.getFullYear() === bDate.getFullYear() &&
    a.getMonth() === bDate.getMonth() &&
    a.getDate() === bDate.getDate()
  );
}

// «Сентябрь» — подпись месяца над недельной лентой.
export function formatMonthLabel(date: Date = new Date()): string {
  const label = date.toLocaleDateString('ru-RU', { month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Число подряд идущих дней с тренировкой, считая от сегодня (или вчера,
// если сегодня ещё не тренировались — серия не должна обнуляться раньше
// полуночи).
export function computeStreak(trainedDates: Date[]): number {
  if (trainedDates.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  if (!trainedDates.some((d) => isSameDay(d, cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!trainedDates.some((d) => isSameDay(d, cursor))) return 0;
  }

  let streak = 0;
  while (trainedDates.some((d) => isSameDay(d, cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
