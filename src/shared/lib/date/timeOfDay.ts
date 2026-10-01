// Порт forma-next/src/utils/timeOfDay — статус времени суток по часовому
// поясу пользователя, нужен для условия «morning» у Фитнес Бро (см.
// modules/bro/helpers/broMessages.ts).

// Часовой пояс по умолчанию — время сервера (Москва = UTC+3), назначается
// новым пользователям, пока они не выберут свой (на мобиле этого шага пока
// нет — почти всегда используется этот дефолт).
export const DEFAULT_TIMEZONE = 'UTC+3';

export type TimeOfDay =
  'midnight' | 'sunrise' | 'morning' | 'day' | 'noon' | 'sunset' | 'night';

function offsetHours(timezone: string): number {
  const n = parseInt(timezone.replace('UTC', ''), 10);
  return Number.isNaN(n) ? 3 : n;
}

/**
 * 00:00–04:59 полночь · 05:00–07:59 восход · 08:00–11:59 утро ·
 * 12:00–15:59 день · 16:00–18:59 полдень · 19:00–20:59 закат · 21:00–23:59 ночь
 */
export function getTimeOfDay(
  timezone: string = DEFAULT_TIMEZONE,
  date: Date = new Date(),
): TimeOfDay {
  const hour = (((date.getUTCHours() + offsetHours(timezone)) % 24) + 24) % 24;

  if (hour < 5) return 'midnight';
  if (hour < 8) return 'sunrise';
  if (hour < 12) return 'morning';
  if (hour < 16) return 'day';
  if (hour < 19) return 'noon';
  if (hour < 21) return 'sunset';
  return 'night';
}
