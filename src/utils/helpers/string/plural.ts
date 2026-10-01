// Порт forma-next/src/utils/formatters — склонение и формат тоннажа для
// реплик Фитнес Бро (см. src/utils/helpers/bro/broMessages.ts).
type PluralForms = readonly [one: string, few: string, many: string];

function plural(n: number, forms: PluralForms): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return forms[1];
  return forms[2];
}

export function pluralizeWeeks(n: number): string {
  return `${n} ${plural(n, ['неделя', 'недели', 'недель'])}`;
}

export function pluralizeWorkouts(n: number): string {
  return `${n} ${plural(n, ['тренировка', 'тренировки', 'тренировок'])}`;
}

export function pluralizeTimes(n: number): string {
  return `${n} ${plural(n, ['раз', 'раза', 'раз'])}`;
}
