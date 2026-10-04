import type {
  Exercise,
  ExerciseCatalogItem,
  ExerciseMuscle,
} from '@/modules/programs';

import { isTimedExercise, isTimedType } from './format';

// Подбор упражнения из каталога для замены и добавления во время тренировки.
// Логика подбора — как на сайте (forma-next, ReplaceExerciseModal/replaceUtils).

interface MuscleProfile {
  primary: Set<string>;
  all: Set<string>;
}

function muscleProfile(muscles: ExerciseMuscle[]): MuscleProfile {
  const primary = new Set<string>();
  const all = new Set<string>();
  for (const m of muscles) {
    all.add(m.name);
    if (m.role === 'primary') primary.add(m.name);
  }
  return { primary, all };
}

// Похожесть кандидата на исходное упражнение: общая основная мышца — лучшая
// замена, остальные пересечения уточняют порядок. 0 — ничего общего.
export function muscleMatchScore(
  source: ExerciseMuscle[],
  candidate: ExerciseMuscle[],
): number {
  const profile = muscleProfile(source);
  if (profile.all.size === 0) return 0;

  let score = 0;
  for (const m of candidate) {
    if (!profile.all.has(m.name)) continue;
    const sourcePrimary = profile.primary.has(m.name);
    if (m.role === 'primary' && sourcePrimary) score += 4;
    else if (m.role === 'primary' || sourcePrimary) score += 2;
    else score += 1;
  }
  return score;
}

// Рекомендованные замены: заданные тренером в админке, а если их нет —
// лучшие совпадения по мышцам.
export function recommendedReplacements(
  catalog: ExerciseCatalogItem[],
  source: Pick<Exercise, 'catalogExerciseId' | 'muscles'>,
  limit = 4,
): ExerciseCatalogItem[] {
  const sourceItem = catalog.find((c) => c.id === source.catalogExerciseId);
  const explicit = sourceItem?.recommendedReplacementIds ?? [];
  if (explicit.length > 0) {
    return explicit
      .map((id) => catalog.find((c) => c.id === id))
      .filter((c): c is ExerciseCatalogItem => !!c);
  }

  const muscles = source.muscles.length
    ? source.muscles
    : (sourceItem?.muscles ?? []);
  return catalog
    .filter((c) => c.id !== source.catalogExerciseId)
    .map((item) => ({ item, score: muscleMatchScore(muscles, item.muscles) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map((e) => e.item);
}

// Поиск по названию: каждое слово запроса — начало какого-то слова в
// названии («жим лёж» → «Жим лёжа», но не «Отжимания»), без учёта регистра
// и «ё». Пустой запрос — весь список. С source — ближе по мышцам выше,
// иначе по алфавиту.
export function searchCatalog(
  catalog: ExerciseCatalogItem[],
  query: string,
  source?: Pick<Exercise, 'muscles'>,
): ExerciseCatalogItem[] {
  const words = (s: string) =>
    s
      .toLowerCase()
      .replace(/ё/g, 'е')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  const terms = words(query);
  const found = terms.length
    ? catalog.filter((c) => {
        const name = words(c.name);
        return terms.every((t) => name.some((w) => w.startsWith(t)));
      })
    : catalog;

  return found
    .map((item) => ({
      item,
      score: source ? muscleMatchScore(source.muscles, item.muscles) : 0,
    }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((e) => e.item);
}

// Мышцы одной строкой: сначала основные.
export function formatMuscles(muscles: ExerciseMuscle[]): string {
  return [
    ...muscles.filter((m) => m.role === 'primary'),
    ...muscles.filter((m) => m.role === 'secondary'),
  ]
    .map((m) => m.name)
    .join(', ');
}

// Цель подхода нового упражнения — те же значения по умолчанию, что ставит
// сервер (SessionExercisesView), но время — для всех временных типов, как их
// показывает приложение (isTimedExercise).
function defaultTarget(item: ExerciseCatalogItem) {
  return isTimedType(item.exerciseType)
    ? {
        sets: 1,
        repsMin: null,
        repsMax: null,
        durationSeconds: 60,
        restSeconds: 60,
      }
    : {
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        durationSeconds: null,
        restSeconds: 90,
      };
}

// Описание упражнения из каталога — то, что меняется при замене.
function catalogFields(item: ExerciseCatalogItem) {
  return {
    catalogExerciseId: item.id,
    name: item.name,
    exerciseType: item.exerciseType,
    description: item.description,
    additionalInfo: item.additionalInfo,
    muscles: item.muscles,
    thumbnailUrl: item.imageUrl,
    videoUrl: item.videoUrl,
  };
}

// Новое упражнение тренировки из каталога. id — локальный, серверный придёт
// из очереди синхронизации (см. sync/outbox, exerciseIds).
export function exerciseFromCatalog(
  item: ExerciseCatalogItem,
  id: string,
  orderIndex: number,
): Exercise {
  return {
    id,
    shortId: '',
    ...catalogFields(item),
    ...defaultTarget(item),
    notes: null,
    orderIndex,
    supersetGroup: null,
    isCustom: true,
  };
}

// Замена: описание — от нового упражнения, план (подходы, повторы, отдых) —
// прежний. Если меняется вид ввода (вес × повторы ↔ время), план берём по
// умолчанию для нового: старые повторы для упражнения на время бессмысленны.
export function replaceWithCatalog(
  exercise: Exercise,
  item: ExerciseCatalogItem,
): Exercise {
  const sameInput =
    isTimedExercise(exercise) === isTimedType(item.exerciseType);
  const target = defaultTarget(item);

  return {
    ...exercise,
    ...catalogFields(item),
    ...(sameInput
      ? {}
      : {
          repsMin: target.repsMin,
          repsMax: target.repsMax,
          durationSeconds: target.durationSeconds,
        }),
  };
}
