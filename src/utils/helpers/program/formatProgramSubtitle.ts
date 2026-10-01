import type { Program } from '@/api';
import { pluralizeTimes } from '@/utils/helpers/string/plural';

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
