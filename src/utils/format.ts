import type { Exercise, Program } from '@/api/types';

const TIMED_TYPES = new Set(['cardio', 'stretch', 'yoga']);

export function isTimedExercise(exercise: Exercise) {
  return TIMED_TYPES.has(exercise.exerciseType);
}

export function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Цель подхода: repsMin–repsMax (или одно число, если равны), для временных
// типов — durationSeconds в формате мм:сс (если секунды 00 — «N мин», без
// «:00», чтобы не путать с числом повторов).
export function formatTarget(exercise: Exercise): string {
  if (isTimedExercise(exercise) && exercise.durationSeconds != null) {
    const seconds = exercise.durationSeconds % 60;
    return seconds === 0
      ? `${Math.floor(exercise.durationSeconds / 60)} мин`
      : formatMMSS(exercise.durationSeconds);
  }

  const { repsMin, repsMax } = exercise;

  if (repsMin != null && repsMax != null) {
    return repsMin === repsMax ? String(repsMin) : `${repsMin}–${repsMax}`;
  }

  return String(repsMin ?? repsMax ?? '—');
}

// «214 156» вместо «214156» — разряды через узкий пробел, как принято в ru-RU.
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ru-RU');
}

// «8–12 повторов» / «5:00» — цель подхода с подписью единицы (для временных
// упражнений единица уже внутри formatTarget, для остальных дописываем слово).
export function formatTargetLabel(exercise: Exercise): string {
  const target = formatTarget(exercise);
  return isTimedExercise(exercise) ? target : `${target} повторов`;
}

// Для временного упражнения с одним подходом сама длительность уже
// однозначна — «1 ×» перед ней только шумит.
export function formatSetsLine(exercise: Exercise): string {
  const target = formatTarget(exercise);

  if (isTimedExercise(exercise) && exercise.sets === 1) {
    return target;
  }

  return `${exercise.sets} × ${target}`;
}

// Порт forma-next/src/utils/formatters — склонение и формат тоннажа для
// реплик Фитнес Бро (см. src/utils/bro.ts).
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

// Место тренировки — в тексте программы (Program.goal) это ключ выбора из
// админки (bars/gym/home), goalLabel — именительный падеж ("Зал", «Турники»);
// для подписи карточки нужен именно предложный падеж, поэтому короткий
// словарь здесь, а не goalLabel напрямую.
const PLACE_PHRASE: Record<string, string> = {
  gym: 'В зале',
  home: 'Дома',
  bars: 'На турниках',
};

// «В зале. 3 раза в неделю» — единая подпись карточки программы везде
// (wide/medium/preview), вместо вольного описания программы.
export function formatProgramSubtitle(
  program: Pick<Program, 'goal' | 'daysPerWeek'>,
): string {
  const place = program.goal ? PLACE_PHRASE[program.goal] : null;
  return [place, `${pluralizeTimes(program.daysPerWeek)} в неделю`]
    .filter(Boolean)
    .join('. ');
}

// Малые нагрузки — в кг, крупные — в тоннах: 850 → «850 кг», 12540 → «12,5 т».
export function formatTonnage(kg: number): string {
  if (kg >= 1000) {
    const tonnes = kg / 1000;
    const text =
      tonnes >= 100 ? Math.round(tonnes).toString() : tonnes.toFixed(1);
    return `${text.replace('.', ',')} т`;
  }
  return `${formatNumber(kg)} кг`;
}
