const WEEKDAY_LETTERS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export interface WeekDay {
  date: Date;
  label: string;
  dayNumber: number;
  isToday: boolean;
}

// Текущая неделя Пн–Вс (а не «сегодня плюс 6 дней вперёд») — так пользователь
// сразу видит, сколько дней уже тренировался на этой неделе.
export function getCurrentWeek(): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoWeekday = (today.getDay() + 6) % 7; // 0 = понедельник
  const monday = new Date(today);
  monday.setDate(today.getDate() - isoWeekday);

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

export function isSameDay(a: Date, b: string | Date): boolean {
  const bDate = typeof b === 'string' ? new Date(b) : b;
  return (
    a.getFullYear() === bDate.getFullYear() &&
    a.getMonth() === bDate.getMonth() &&
    a.getDate() === bDate.getDate()
  );
}

// «Сегодня, 24 сентября» — подзаголовок в шапке главного экрана.
export function formatTodayLabel(): string {
  const label = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  return `Сегодня, ${label}`;
}

// «Сентябрь» — подпись месяца над недельной лентой.
export function formatMonthLabel(): string {
  const label = new Date().toLocaleDateString('ru-RU', { month: 'long' });
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
