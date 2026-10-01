import type { User } from '@/modules/auth';
import type { WorkoutWithExercises } from '@/modules/programs';
import type { SessionWithWorkout } from '@/modules/workout';

import {
  BroPriority,
  buildBroMessages,
  daysSinceLastWorkout,
  FALLBACK_PHRASES,
  findRecentAchievement,
  getNextWorkout,
  getWeeklyGoal,
  isRecordVolume,
  sessionVolumeKg,
  type BroTodayContext,
} from '../helpers/broMessages';
import type { AchievementsResponse } from '../models/achievement';
import type { BroCondition, BroPhrase } from '../models/bro';
import type { UserStats } from '../models/stats';

const NOW = new Date('2026-01-15T12:00:00Z');
const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY).toISOString();

beforeEach(() => jest.useFakeTimers({ now: NOW }));
afterEach(() => jest.useRealTimers());

// --- фабрики ---

const session = (extra: Partial<SessionWithWorkout>): SessionWithWorkout =>
  ({
    id: 's',
    workoutId: 'w1',
    programId: 'p1',
    status: 'completed',
    startedAt: daysAgo(1),
    completedAt: daysAgo(1),
    exerciseLogs: [],
    ...extra,
  }) as SessionWithWorkout;

const setLog = (
  weight: number | null,
  repsDone: number | null,
  skipped = false,
) =>
  ({ weight, repsDone, skipped }) as SessionWithWorkout['exerciseLogs'][number];

const workout = (id: string) => ({ id }) as WorkoutWithExercises;

const phrase = (
  id: number,
  condition: BroCondition,
  extra: Partial<BroPhrase> = {},
): BroPhrase => ({
  id,
  category: 'cat',
  categoryLabel: 'Категория',
  text: `фраза ${id}`,
  title: '',
  condition,
  action: 'none',
  actionLabel: '',
  priority: 10,
  ...extra,
});

const today = (extra: Partial<BroTodayContext> = {}): BroTodayContext => ({
  isToday: true,
  hasWorkout: false,
  workoutName: null,
  isCompleted: false,
  isInProgress: false,
  onStart: jest.fn(),
  onContinue: jest.fn(),
  completedVolumeKg: null,
  ...extra,
});

type Input = Parameters<typeof buildBroMessages>[0];
const build = (extra: Partial<Input> = {}) =>
  buildBroMessages({
    phrases: [],
    stats: null,
    user: null,
    water: null,
    timeOfDay: 'day',
    today: today(),
    recentAchievement: null,
    daysSincePause: null,
    isVolumeRecord: false,
    weeklyGoal: null,
    showPro: false,
    speechSeed: 0,
    onNavigatePrograms: jest.fn(),
    onShowProInfo: jest.fn(),
    ...extra,
  });
const ids = (extra: Partial<Input> = {}) => build(extra).map((m) => m.id);

// --- вспомогательные расчёты ---

describe('getWeeklyGoal', () => {
  it('цели нет — карточки нет', () => {
    expect(getWeeklyGoal(null, 0)).toBeNull();
    expect(getWeeklyGoal(0, 0)).toBeNull();
  });

  it('неделя только началась — вся цель', () => {
    expect(getWeeklyGoal(3, 0)).toEqual({
      primary: '3 тренировки',
      secondary: 'на этой неделе',
    });
  });

  it('часть сделана — сколько осталось', () => {
    expect(getWeeklyGoal(3, 2)?.primary).toBe('Ещё 1 тренировка');
  });

  it('выполнена и перевыполнена', () => {
    expect(getWeeklyGoal(3, 3)?.primary).toBe('Цель недели выполнена');
    expect(getWeeklyGoal(3, 5)?.primary).toBe('Цель недели выполнена');
  });
});

describe('findRecentAchievement', () => {
  const res = (tiers: { earned: boolean; earnedAt: string | null }[][]) =>
    ({
      achievements: tiers.map((t, i) => ({
        name: `ачивка ${i}`,
        emoji: '🏅',
        tiers: t,
      })),
    }) as unknown as AchievementsResponse;

  it('самая свежая из полученных за последние 3 дня', () => {
    expect(
      findRecentAchievement(
        res([
          [{ earned: true, earnedAt: daysAgo(2) }],
          [{ earned: true, earnedAt: daysAgo(1) }],
        ]),
      )?.name,
    ).toBe('ачивка 1');
  });

  it('старые и не полученные не считаются', () => {
    expect(
      findRecentAchievement(
        res([
          [{ earned: true, earnedAt: daysAgo(4) }],
          [{ earned: false, earnedAt: daysAgo(1) }],
          [{ earned: true, earnedAt: null }],
        ]),
      ),
    ).toBeNull();
  });
});

describe('sessionVolumeKg', () => {
  it('вес × повторы без пропущенных и пустых подходов', () => {
    expect(
      sessionVolumeKg(
        session({
          exerciseLogs: [
            setLog(50, 10),
            setLog(60, 8),
            setLog(100, 5, true),
            setLog(null, 12),
          ],
        }),
      ),
    ).toBe(980);
  });
});

describe('isRecordVolume', () => {
  const startOfToday = new Date('2026-01-15T00:00:00Z').getTime();
  const history = [
    session({ exerciseLogs: [setLog(100, 10)] }), // 1000 кг вчера
    session({
      status: 'in_progress',
      completedAt: null,
      exerciseLogs: [setLog(500, 10)],
    }),
  ];

  it('больше любой прошлой завершённой тренировки', () => {
    expect(isRecordVolume(history, 1200, startOfToday)).toBe(true);
  });

  it('равно прошлому максимуму — не рекорд', () => {
    expect(isRecordVolume(history, 1000, startOfToday)).toBe(false);
  });

  it('нулевой объём — не рекорд', () => {
    expect(isRecordVolume([], 0, startOfToday)).toBe(false);
  });

  it('сегодняшняя тренировка не сравнивается сама с собой', () => {
    const withToday = [
      ...history,
      session({
        completedAt: NOW.toISOString(),
        exerciseLogs: [setLog(150, 10)],
      }),
    ];
    expect(isRecordVolume(withToday, 1500, startOfToday)).toBe(true);
  });
});

describe('daysSinceLastWorkout', () => {
  it('нет завершённых — null', () => {
    expect(daysSinceLastWorkout([])).toBeNull();
    expect(
      daysSinceLastWorkout([
        session({ status: 'in_progress', completedAt: null }),
      ]),
    ).toBeNull();
  });

  it('по последней завершённой, полные дни', () => {
    expect(
      daysSinceLastWorkout([
        session({ completedAt: daysAgo(10) }),
        session({ completedAt: daysAgo(3.5) }),
      ]),
    ).toBe(3);
  });
});

describe('getNextWorkout', () => {
  const workouts = [workout('w1'), workout('w2'), workout('w3')];

  it('программа без тренировок', () => {
    expect(getNextWorkout([], [], 'p1')).toBeNull();
  });

  it('ещё не тренировался — первая', () => {
    expect(getNextWorkout(workouts, [], 'p1')?.id).toBe('w1');
  });

  it('следующая после последней завершённой', () => {
    const history = [
      session({ workoutId: 'w1', startedAt: daysAgo(3) }),
      session({ workoutId: 'w2', startedAt: daysAgo(1) }),
    ];
    expect(getNextWorkout(workouts, history, 'p1')?.id).toBe('w3');
  });

  it('после последней — по кругу на первую', () => {
    expect(
      getNextWorkout(workouts, [session({ workoutId: 'w3' })], 'p1')?.id,
    ).toBe('w1');
  });

  it('другие программы и незавершённые сессии не учитываются', () => {
    const history = [
      session({ workoutId: 'w2', programId: 'p2' }),
      session({ workoutId: 'w2', status: 'in_progress' }),
    ];
    expect(getNextWorkout(workouts, history, 'p1')?.id).toBe('w1');
  });

  it('тренировка удалена из программы — с начала', () => {
    expect(
      getNextWorkout(workouts, [session({ workoutId: 'gone' })], 'p1')?.id,
    ).toBe('w1');
  });
});

// --- подбор реплик ---

describe('buildBroMessages', () => {
  it('без данных — пусто', () => {
    expect(build()).toEqual([]);
  });

  it('сортирует по приоритету', () => {
    const messages = build({
      stats: { streak: 5, comeback: null } as UserStats,
      recentAchievement: { name: 'Первая', emoji: '🥇' },
      weeklyGoal: { primary: '3 тренировки', secondary: 'на этой неделе' },
    });
    expect(messages.map((m) => m.id)).toEqual([
      'achievement',
      'streak',
      'goal',
    ]);
    expect(messages.map((m) => m.priority)).toEqual([
      BroPriority.Achievement,
      BroPriority.StreakMilestone,
      BroPriority.WeeklyGoal,
    ]);
  });

  it('спаси стрик — сверху, с остатком тренировок', () => {
    const [first] = build({
      stats: {
        streak: 0,
        comeback: { active: true, streakAtRisk: 4, daysNeeded: 3, daysDone: 1 },
      } as UserStats,
      weeklyGoal: { primary: 'x', secondary: 'y' },
    });
    expect(first.id).toBe('comeback');
    expect(first.text).toContain('Под угрозой 4 недели');
    expect(first.text).toContain('осталось 2 тренировки');
  });

  it('стрик — только на «круглых» отметках', () => {
    expect(ids({ stats: { streak: 10 } as UserStats })).toContain('streak');
    expect(ids({ stats: { streak: 11 } as UserStats })).not.toContain('streak');
  });

  describe('сегодняшняя тренировка', () => {
    it('есть и не начата — «Начать»', () => {
      const t = today({ hasWorkout: true, workoutName: 'Ноги' });
      const [m] = build({ today: t });
      expect(m.text).toBe('Сегодня «Ноги» — погнали! 🔥');
      expect(m.cta?.label).toBe('Начать');
      m.cta?.onPress();
      expect(t.onStart).toHaveBeenCalled();
    });

    it('идёт — «Продолжить»', () => {
      const t = today({
        hasWorkout: true,
        workoutName: 'Ноги',
        isInProgress: true,
      });
      const [m] = build({ today: t });
      expect(m.cta?.label).toBe('Продолжить');
      m.cta?.onPress();
      expect(t.onContinue).toHaveBeenCalled();
    });

    it('завершена — похвала вместо призыва', () => {
      const t = today({
        hasWorkout: true,
        workoutName: 'Ноги',
        isCompleted: true,
        completedVolumeKg: 2500,
      });
      const messages = build({ today: t });
      expect(messages.map((m) => m.id)).toEqual(['praise']);
      expect(messages[0].text).toContain('2,5 т поднято');
    });

    it('похвала без объёма и рекорд', () => {
      const done = today({ isCompleted: true });
      expect(build({ today: done })[0].text).toBe(
        'Красава! Тренировка закрыта — ты сегодня молодец 💪',
      );
      const record = build({
        today: today({ isCompleted: true, completedVolumeKg: 800 }),
        isVolumeRecord: true,
      })[0];
      expect(record.category).toBe('Личный рекорд! 🏆');
      expect(record.text).toContain('Рекорд! 800 кг');
    });
  });

  describe('условные фразы', () => {
    const p = (condition: BroCondition) => [phrase(1, condition)];
    const shown = (condition: BroCondition, extra: Partial<Input>) =>
      ids({ phrases: p(condition), ...extra }).includes('db-1');

    it('утро — на рассвете и утром', () => {
      expect(shown('morning', { timeOfDay: 'sunrise' })).toBe(true);
      expect(shown('morning', { timeOfDay: 'morning' })).toBe(true);
      expect(shown('morning', { timeOfDay: 'day' })).toBe(false);
    });

    it('мало воды — пока не выпита дневная норма', () => {
      const water = (consumedMl: number, goalMl = 2000) =>
        ({ consumedMl, goalMl }) as Input['water'];
      expect(shown('water_low', { water: water(500) })).toBe(true);
      expect(shown('water_low', { water: water(2000) })).toBe(false);
      expect(shown('water_low', { water: water(0, 0) })).toBe(false);
      expect(shown('water_low', { water: null })).toBe(false);
    });

    it('день отдыха и день тренировки взаимоисключающие', () => {
      const rest = today({ hasWorkout: false });
      const train = today({ hasWorkout: true });
      expect(shown('rest_day', { today: rest })).toBe(true);
      expect(shown('rest_day', { today: train })).toBe(false);
      expect(shown('workout_today', { today: train })).toBe(true);
      expect(shown('workout_today', { today: rest })).toBe(false);
    });

    it('знакомство — если бэк просит и профиль не заполнен', () => {
      const user = (extra: Partial<User>) =>
        ({ showOnboarding: true, ...extra }) as User;
      expect(shown('onboarding', { user: user({}) })).toBe(true);
      expect(
        shown('onboarding', { user: user({ showOnboarding: false }) }),
      ).toBe(false);
    });

    it('возвращение — после недели перерыва', () => {
      expect(shown('return_after_pause', { daysSincePause: 7 })).toBe(true);
      expect(shown('return_after_pause', { daysSincePause: 6 })).toBe(false);
      expect(shown('return_after_pause', { daysSincePause: null })).toBe(false);
    });

    it('промо ПРО — только без ПРО и когда разрешено показывать', () => {
      const free = { hasProAccess: false } as User;
      expect(shown('pro_promo', { user: free, showPro: true })).toBe(true);
      expect(shown('pro_promo', { user: free, showPro: false })).toBe(false);
      expect(
        shown('pro_promo', {
          user: { hasProAccess: true } as User,
          showPro: true,
        }),
      ).toBe(false);
    });
  });

  describe('кнопки фраз', () => {
    const cta = (action: BroPhrase['action'], extra: Partial<Input> = {}) =>
      build({
        phrases: [phrase(1, 'morning', { action, actionLabel: 'Жми' })],
        timeOfDay: 'morning',
        ...extra,
      })[0].cta;

    it('programs и subscription ведут к своим обработчикам', () => {
      const onNavigatePrograms = jest.fn();
      const onShowProInfo = jest.fn();
      cta('programs', { onNavigatePrograms })?.onPress();
      cta('subscription', { onShowProInfo })?.onPress();
      expect(onNavigatePrograms).toHaveBeenCalled();
      expect(onShowProInfo).toHaveBeenCalled();
    });

    it('workout запускает тренировку', () => {
      const t = today();
      cta('workout', { today: t })?.onPress();
      expect(t.onStart).toHaveBeenCalled();
    });

    it('экранов воды/ачивок на мобиле нет — без кнопки', () => {
      expect(cta('water')).toBeUndefined();
      expect(cta('achievements')).toBeUndefined();
      expect(cta('none')).toBeUndefined();
    });
  });

  describe('совет из общего пула', () => {
    const pool = [
      phrase(1, 'always'),
      phrase(2, 'always'),
      phrase(3, 'always'),
    ];

    it('ровно один, выбирается по seed', () => {
      const speech = (speechSeed: number) =>
        build({ phrases: pool, speechSeed }).filter((m) => m.id === 'speech');
      expect(speech(0)).toHaveLength(1);
      expect(speech(0)[0].text).toBe('фраза 1');
      expect(speech(0.5)[0].text).toBe('фраза 2');
      expect(speech(0.99)[0].text).toBe('фраза 3');
    });

    it('всегда в конце списка', () => {
      const messages = build({
        phrases: pool,
        weeklyGoal: { primary: 'x', secondary: 'y' },
      });
      expect(messages.at(-1)?.id).toBe('speech');
    });
  });

  it('офлайн-фразы: уникальные id и есть общий пул', () => {
    const fallbackIds = FALLBACK_PHRASES.map((f) => f.id);
    expect(new Set(fallbackIds).size).toBe(fallbackIds.length);
    expect(
      FALLBACK_PHRASES.filter((f) => f.condition === 'always').length,
    ).toBeGreaterThan(0);
  });
});
