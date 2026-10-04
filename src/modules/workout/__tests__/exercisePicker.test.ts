import type { Exercise, ExerciseCatalogItem } from '@/modules/programs';

import {
  exerciseFromCatalog,
  muscleMatchScore,
  recommendedReplacements,
  replaceWithCatalog,
  searchCatalog,
} from '../helpers/exercisePicker';

const muscle = (name: string, role: 'primary' | 'secondary' = 'primary') => ({
  name,
  group: '',
  role,
  region: null,
});

const item = (
  id: string,
  extra: Partial<ExerciseCatalogItem> = {},
): ExerciseCatalogItem => ({
  id,
  name: id,
  description: null,
  additionalInfo: null,
  muscles: [],
  equipmentType: null,
  exerciseType: 'strength',
  videoUrl: null,
  imageUrl: null,
  recommendedReplacementIds: [],
  ...extra,
});

const catalog = [
  item('Жим лёжа', {
    muscles: [muscle('Грудь'), muscle('Трицепс', 'secondary')],
  }),
  item('Отжимания', {
    muscles: [muscle('Грудь'), muscle('Трицепс', 'secondary')],
  }),
  item('Французский жим', { muscles: [muscle('Трицепс')] }),
  item('Присед', { muscles: [muscle('Ноги')] }),
  item('Бег', { exerciseType: 'cardio' }),
];

describe('подбор упражнения', () => {
  it('общая основная мышца весит больше второстепенной', () => {
    const source = [muscle('Грудь'), muscle('Трицепс', 'secondary')];
    expect(muscleMatchScore(source, [muscle('Грудь')])).toBe(4);
    expect(muscleMatchScore(source, [muscle('Трицепс')])).toBe(2);
    expect(muscleMatchScore(source, [muscle('Ноги')])).toBe(0);
  });

  it('замены из админки — в первую очередь', () => {
    const withExplicit = [
      ...catalog,
      item('Кроссовер', { recommendedReplacementIds: ['Присед'] }),
    ];
    expect(
      recommendedReplacements(withExplicit, {
        catalogExerciseId: 'Кроссовер',
        muscles: [muscle('Грудь')],
      }).map((c) => c.id),
    ).toEqual(['Присед']);
  });

  it('без замен из админки — по мышцам, без самого упражнения', () => {
    expect(
      recommendedReplacements(catalog, {
        catalogExerciseId: 'Жим лёжа',
        muscles: [],
      }).map((c) => c.id),
    ).toEqual(['Отжимания', 'Французский жим']);
  });

  it('поиск без учёта регистра и «ё», похожие выше', () => {
    expect(searchCatalog(catalog, 'ЖИМ ЛЕЖА').map((c) => c.id)).toEqual([
      'Жим лёжа',
    ]);
    expect(
      searchCatalog(catalog, 'жим', { muscles: [muscle('Трицепс')] }).map(
        (c) => c.id,
      ),
    ).toEqual(['Французский жим', 'Жим лёжа']);
  });

  it('новое упражнение — план по умолчанию по виду ввода', () => {
    expect(exerciseFromCatalog(catalog[0], 'x', 2)).toMatchObject({
      id: 'x',
      catalogExerciseId: 'Жим лёжа',
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      isCustom: true,
    });
    expect(exerciseFromCatalog(catalog[4], 'y', 2)).toMatchObject({
      sets: 1,
      durationSeconds: 60,
      repsMin: null,
    });
  });

  it('замена сохраняет план, если вид ввода тот же', () => {
    const base = {
      ...exerciseFromCatalog(catalog[0], 'e1', 1),
      sets: 5,
      repsMin: 5,
      repsMax: 5,
    } as Exercise;
    expect(replaceWithCatalog(base, catalog[1])).toMatchObject({
      id: 'e1',
      name: 'Отжимания',
      sets: 5,
      repsMin: 5,
    });
    expect(replaceWithCatalog(base, catalog[4])).toMatchObject({
      sets: 5,
      repsMin: null,
      durationSeconds: 60,
    });
  });
});
