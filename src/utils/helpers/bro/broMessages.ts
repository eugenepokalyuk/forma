import type {
  AchievementsResponse,
  BroAction,
  BroCondition,
  BroPhrase,
  SessionWithWorkout,
  User,
  UserStats,
  WaterToday,
  WorkoutWithExercises,
} from '@/api';
import { formatTonnage } from '@/utils/helpers/string/number';
import {
  pluralizeWeeks,
  pluralizeWorkouts,
} from '@/utils/helpers/string/plural';
import { isOnboardingComplete } from '@/utils/helpers/user/onboarding';
import type { TimeOfDay } from '@/utils/helpers/date/timeOfDay';

// Порт forma-next/src/components/modules/FitnessBro/_utils/broMessages.ts —
// та же логика подбора реплик Фитнес Бро, что и на сайте (см. AGENTS.md
// forma-project для оригинала), адаптированная под мобилу:
//  - вместо Link href — imperative onPress (роутинг через expo-router);
//  - действия без экрана на мобиле (water/onboarding/achievements) сейчас
//    не имеют своего пункта назначения — такие реплики рендерятся без кнопки
//    (см. phraseCta), пока эти экраны не появятся в приложении.

const bro = {
  goalTitle: 'Цель недели 🎯',
  streakTitle: 'Твой стрик 🔥',
  streakSuffix: 'подряд — ты машина! 🔥 Держим планку',
  morningTitle: 'Доброе утро ☀️',
  morning: 'Доброе утро! ☀️ Лёгкая разминка — и день пойдёт бодрее',
  proTitle: 'Форма ПРО ⭐️',
  pro: 'Кстати, с ПРО открыты все программы. Без спешки — как надумаешь 😉',
  proCta: 'Оформить ПРО',
  cheerTitle: 'На заряде 💪',
  water:
    'Воды сегодня пока маловато 💧 Сделай пару глотков — даже лёгкое обезвоживание бьёт по силе',
  onboarding: {
    title: 'Давай познакомимся 👋',
    text: 'Заполни данные о себе — и программы станут точнее',
  },
  workout: {
    title: 'Пора размяться 🦵',
    text: (name: string) => `Сегодня «${name}» — погнали! 🔥`,
    start: 'Начать',
    continueLabel: 'Продолжить',
  },
  restDay: {
    title: 'День отдыха 😴',
    text: 'Сегодня отдых. Восстановление — тоже часть прогресса: сон и вода сейчас важнее любого спортпита',
  },
  praise: {
    title: 'Тренировка закрыта 💪',
    withVolume: (tonnage: string) =>
      `Красава! Сегодня ${tonnage} поднято — тело скажет спасибо 💪`,
    plain: 'Красава! Тренировка закрыта — ты сегодня молодец 💪',
    recordTitle: 'Личный рекорд! 🏆',
    record: (tonnage: string) =>
      `Рекорд! ${tonnage} за тренировку — больше, чем когда-либо. Ты в огне 🔥🏆`,
  },
  achievement: {
    title: 'Новое достижение 🏅',
    text: (emoji: string, name: string) =>
      `Ты открыл достижение ${emoji} «${name}» — красава! Загляни в профиль.`,
  },
  returnBack: {
    title: 'С возвращением 👋',
    text: 'Давно не виделись! Ничего страшного — начни с лёгкого, и форма быстро вернётся.',
    cta: 'К программам',
  },
  cheers: [
    'Ты сегодня в ударе — я чувствую! 💪',
    'Каждая тренировка делает тебя сильнее. Погнали!',
    'Тело потом скажет спасибо. Дай пять! ✋',
    'Дисциплина сильнее мотивации. А ты уже здесь — это главное 🔥',
    'Маленькие шаги — большие результаты. У тебя получится!',
    'Отличный день, чтобы стать чуть сильнее вчерашнего себя',
    'Я в тебя верю. Осталось только начать 😎',
    'Форма — это привычка. И ты её строишь прямо сейчас!',
    'Не идеально, а регулярно. Ты на верном пути 🚀',
  ],
  categories: {
    nutrition: 'Питание',
    hydration: 'Гидратация',
    warmup: 'Разминка',
    timing: 'Время тренировки',
    sleep: 'Сон и восстановление',
    mindset: 'Ментальный настрой',
  },
  tips: {
    nutrition: [
      'Сегодня тренировка — постарайся за 2–3 часа до зала нормально поесть: рис, гречка, макароны, хлеб. С углеводами тело в середине тренировки работает стабильнее',
      'Тренировка вечером? Не пропускай обед. Если к вечеру тело не получило нормальных углеводов, энергии в зале будет заметно меньше',
      'Не успел(а) поесть перед залом? Банан, горсть сухофруктов или протеиновый батончик за 30–40 минут — быстрые углеводы усвоятся до начала и поддержат энергию в первых подходах',
    ],
    hydration: [
      'Пей воду равномерно в течение дня — не жди момента перед залом. Обезвоживание даже на 2% снижает работоспособность, а жажда появляется, когда оно уже случилось',
      'Возьми с собой бутылку воды — минимум 0.5 л, лучше литр. Если тренировка дольше часа, добавь изотоник или щепотку соли: поможет удержать электролиты',
      'Пил(а) кофе сегодня? До зала выпей дополнительно 300–400 мл воды. Кофеин ускоряет вывод жидкости — заходи в зал с запасом',
    ],
    warmup: [
      'Заложи первый разминочный подход с лёгким весом в каждом упражнении. В объём он не идёт, но тело настраивается — рабочие подходы идут заметно чище',
    ],
    timing: [
      'Если можешь выбрать время — с 16:00 до 20:00 у большинства пик энергии и концентрации. Если нет — стабильное расписание важнее идеального часа раз в неделю',
      'Идёшь утром натощак? Для тренировки до 40 минут — нормально. Планируешь дольше и тяжелее — лёгкий перекус за 20–30 минут поможет: банан, йогурт, тост',
    ],
    sleep: [
      'Спал(а) меньше 6 часов? Всё равно иди, но снизь нагрузку на 10–15% и не жди максимума. Недосып снижает выносливость — это физиология, не слабость',
      'Мышцы восстанавливаются во сне, а не в зале. Хорошо потренировался — постарайся лечь до полуночи. Это важнее любого спортпита после тренировки',
    ],
    mindset: [
      'Нет настроения идти? Задача-минимум — просто добраться до зала и начать разминку. Дальше обычно легче: первый шаг самый тяжёлый',
      'Сегодня не нужно выжимать максимум. Выйти из зала с ощущением «хорошая тренировка» — уже результат. Стабильность в сумме даёт больше, чем редкие тренировки на пределе',
    ],
  },
} as const;

const cb = {
  title: 'Спаси свой стрик 🧊',
  atRisk: 'Под угрозой',
  finish: 'Заверши неделю — осталось',
  tail: ', и прошлая неделя заморозится',
};

const goalText = {
  donePrimary: 'Цель недели выполнена',
  doneSecondary: 'отличная работа',
  thisWeek: 'на этой неделе',
  morePrefix: 'Ещё',
};

/** Итог цели недели для карточки Бро — порт forma-next todayUtils.getWeeklyGoal. */
export function getWeeklyGoal(
  workoutFrequency: number | null | undefined,
  completedThisWeek: number,
): { primary: string; secondary: string } | null {
  if (!workoutFrequency || workoutFrequency <= 0) return null;

  const remaining = workoutFrequency - completedThisWeek;

  if (remaining <= 0) {
    return { primary: goalText.donePrimary, secondary: goalText.doneSecondary };
  }
  if (completedThisWeek === 0) {
    return {
      primary: pluralizeWorkouts(workoutFrequency),
      secondary: goalText.thisWeek,
    };
  }
  return {
    primary: `${goalText.morePrefix} ${pluralizeWorkouts(remaining)}`,
    secondary: goalText.thisWeek,
  };
}

export interface BroMessage {
  id: string;
  title?: string;
  category?: string;
  text: string;
  priority: number;
  cta?: { label: string; onPress: () => void };
}

/** Контекст сегодняшнего дня — считается в home.tsx (см. getNextWorkout). */
export interface BroTodayContext {
  isToday: boolean;
  hasWorkout: boolean;
  workoutName: string | null;
  isCompleted: boolean;
  isInProgress: boolean;
  onStart: () => void;
  onContinue: () => void;
  completedVolumeKg: number | null;
}

export const BroPriority = {
  Comeback: 100,
  WorkoutPraise: 82,
  WorkoutHype: 80,
  Achievement: 70,
  StreakMilestone: 60,
  WeeklyGoal: 40,
} as const;

export const RETURN_AFTER_DAYS = 7;
export const ACHIEVEMENT_FRESH_DAYS = 3;

export function findRecentAchievement(
  res: AchievementsResponse,
  days = ACHIEVEMENT_FRESH_DAYS,
): { name: string; emoji: string } | null {
  const cutoff = Date.now() - days * 86_400_000;
  let best: { name: string; emoji: string; at: number } | null = null;

  for (const a of res.achievements) {
    for (const tier of a.tiers) {
      if (!tier.earned || !tier.earnedAt) continue;
      const at = new Date(tier.earnedAt).getTime();
      if (at >= cutoff && (!best || at > best.at)) {
        best = { name: a.name, emoji: a.emoji, at };
      }
    }
  }

  return best ? { name: best.name, emoji: best.emoji } : null;
}

/** Тоннаж сессии, кг (вес × повторы по неархивным логам, без skipped). */
export function sessionVolumeKg(session: SessionWithWorkout): number {
  return session.exerciseLogs.reduce((sum, log) => {
    if (log.skipped || log.weight == null || log.repsDone == null) return sum;
    return sum + log.weight * log.repsDone;
  }, 0);
}

/** Личный рекорд по тоннажу: сегодняшний объём больше любой прошлой тренировки. */
export function isRecordVolume(
  history: SessionWithWorkout[],
  todayVolumeKg: number,
  startOfTodayMs: number,
): boolean {
  if (todayVolumeKg <= 0) return false;
  const pastMax = history
    .filter(
      (s) =>
        s.status === 'completed' &&
        s.completedAt &&
        new Date(s.completedAt).getTime() < startOfTodayMs,
    )
    .reduce((max, s) => Math.max(max, sessionVolumeKg(s)), 0);
  return todayVolumeKg > pastMax;
}

/** Сколько дней прошло с последней завершённой тренировки (или null). */
export function daysSinceLastWorkout(
  history: SessionWithWorkout[],
): number | null {
  const times = history
    .filter((s) => s.status === 'completed' && s.completedAt)
    .map((s) => new Date(s.completedAt as string).getTime());

  if (!times.length) return null;
  return Math.floor((Date.now() - Math.max(...times)) / 86_400_000);
}

/** Следующая по плану тренировка активной программы: по кругу после
 * последней завершённой (как в forma-next TodayView.todayWorkout). */
export function getNextWorkout(
  programWorkouts: WorkoutWithExercises[],
  history: SessionWithWorkout[],
  programId: string,
): WorkoutWithExercises | null {
  if (programWorkouts.length === 0) return null;

  const programSessions = history
    .filter((s) => s.programId === programId && s.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

  if (programSessions.length === 0) return programWorkouts[0];

  const lastIdx = programWorkouts.findIndex(
    (w) => w.id === programSessions[0].workoutId,
  );
  if (lastIdx === -1) return programWorkouts[0];

  return programWorkouts[(lastIdx + 1) % programWorkouts.length];
}

const STREAK_MILESTONES = new Set([3, 5, 8, 10, 15, 20, 26, 39, 52]);

interface ConditionState {
  timeOfDay: TimeOfDay;
  water: WaterToday | null;
  user: User | null;
  today: BroTodayContext;
  daysSincePause: number | null;
  showPro: boolean;
}

function conditionMet(condition: BroCondition, s: ConditionState): boolean {
  switch (condition) {
    case 'morning':
      return s.timeOfDay === 'sunrise' || s.timeOfDay === 'morning';
    case 'water_low':
      return (
        !!s.water && s.water.goalMl > 0 && s.water.consumedMl < s.water.goalMl
      );
    case 'workout_today':
      return s.today.isToday && s.today.hasWorkout && !s.today.isCompleted;
    case 'rest_day':
      return s.today.isToday && !s.today.hasWorkout && !s.today.isCompleted;
    case 'onboarding':
      return !!s.user?.showOnboarding && !isOnboardingComplete(s.user);
    case 'return_after_pause':
      return s.daysSincePause != null && s.daysSincePause >= RETURN_AFTER_DAYS;
    case 'pro_promo':
      return !s.user?.hasProAccess && s.showPro;
    default:
      return false;
  }
}

/** Кнопка-действие из ключа action. Экраны water/onboarding/achievements
 * пока не реализованы на мобиле — для них кнопка не рендерится. */
function phraseCta(
  action: BroAction,
  label: string,
  today: BroTodayContext,
  onNavigatePrograms: () => void,
  onShowProInfo: () => void,
): BroMessage['cta'] {
  switch (action) {
    case 'workout':
      return { label, onPress: today.onStart };
    case 'subscription':
      return { label, onPress: onShowProInfo };
    case 'programs':
      return { label, onPress: onNavigatePrograms };
    default:
      return undefined;
  }
}

function phraseToMessage(
  p: BroPhrase,
  today: BroTodayContext,
  onNavigatePrograms: () => void,
  onShowProInfo: () => void,
): BroMessage {
  const cta =
    p.action !== 'none'
      ? phraseCta(
          p.action,
          p.actionLabel,
          today,
          onNavigatePrograms,
          onShowProInfo,
        )
      : undefined;

  return {
    id: `db-${p.id}`,
    category: p.title || p.categoryLabel,
    text: p.text,
    cta,
    priority: p.priority,
  };
}

function hashId(key: string): number {
  return [...key].reduce((n, ch) => n + ch.charCodeAt(0), 0);
}

/** Офлайн-фолбэк — те же тексты, что в forma-next, на случай если
 * /bro/phrases не загрузился (нет сети, бэкенд недоступен и т.п.). */
export const FALLBACK_PHRASES: BroPhrase[] = [
  ...Object.entries(bro.tips).flatMap(([key, texts]) =>
    texts.map((text, i) => ({
      id: -(hashId(key) * 100 + i),
      category: key,
      categoryLabel: bro.categories[key as keyof typeof bro.categories],
      text,
      title: '',
      condition: 'always' as BroCondition,
      action: 'none' as BroAction,
      actionLabel: '',
      priority: 0,
    })),
  ),
  ...bro.cheers.map((text, i) => ({
    id: -(9000 + i),
    category: 'motivation',
    categoryLabel: bro.cheerTitle,
    text,
    title: '',
    condition: 'always' as BroCondition,
    action: 'none' as BroAction,
    actionLabel: '',
    priority: 0,
  })),
  {
    id: -1,
    category: 'hydration',
    categoryLabel: bro.categories.hydration,
    text: bro.water,
    title: '',
    condition: 'water_low',
    action: 'none',
    actionLabel: '',
    priority: 50,
  },
  {
    id: -2,
    category: 'onboarding',
    categoryLabel: 'Знакомство',
    text: bro.onboarding.text,
    title: bro.onboarding.title,
    condition: 'onboarding',
    action: 'none',
    actionLabel: '',
    priority: 55,
  },
  {
    id: -3,
    category: 'greeting',
    categoryLabel: bro.morningTitle,
    text: bro.morning,
    title: bro.morningTitle,
    condition: 'morning',
    action: 'none',
    actionLabel: '',
    priority: 20,
  },
  {
    id: -4,
    category: 'rest',
    categoryLabel: bro.restDay.title,
    text: bro.restDay.text,
    title: bro.restDay.title,
    condition: 'rest_day',
    action: 'none',
    actionLabel: '',
    priority: 15,
  },
  {
    id: -5,
    category: 'greeting',
    categoryLabel: bro.returnBack.title,
    text: bro.returnBack.text,
    title: bro.returnBack.title,
    condition: 'return_after_pause',
    action: 'programs',
    actionLabel: bro.returnBack.cta,
    priority: 45,
  },
  {
    id: -6,
    category: 'pro',
    categoryLabel: bro.proTitle,
    text: bro.pro,
    title: bro.proTitle,
    condition: 'pro_promo',
    action: 'subscription',
    actionLabel: bro.proCta,
    priority: 5,
  },
];

interface BuildBroMessagesInput {
  /** Фразы из админки или FALLBACK_PHRASES. */
  phrases: BroPhrase[];
  stats: UserStats | null;
  user: User | null;
  water: WaterToday | null;
  timeOfDay: TimeOfDay;
  today: BroTodayContext;
  recentAchievement: { name: string; emoji: string } | null;
  daysSincePause: number | null;
  isVolumeRecord: boolean;
  weeklyGoal: { primary: string; secondary: string } | null;
  showPro: boolean;
  speechSeed: number;
  onNavigatePrograms: () => void;
  onShowProInfo: () => void;
}

/**
 * Список реплик Бро: интерполируемые in-code источники (спаси стрик, похвала,
 * веха, ачивка, хайп) + условные фразы из админки + один случайный совет из
 * пула `always`. Сортируется по приоритету — 1:1 с forma-next buildBroMessages.
 */
export function buildBroMessages({
  phrases,
  stats,
  user,
  water,
  timeOfDay,
  today,
  recentAchievement,
  daysSincePause,
  isVolumeRecord,
  weeklyGoal,
  showPro,
  speechSeed,
  onNavigatePrograms,
  onShowProInfo,
}: BuildBroMessagesInput): BroMessage[] {
  const list: BroMessage[] = [];

  const comeback = stats?.comeback;
  if (comeback?.active) {
    const left = Math.max(comeback.daysNeeded - comeback.daysDone, 0);
    list.push({
      id: 'comeback',
      title: cb.title,
      text: `${cb.atRisk} ${pluralizeWeeks(comeback.streakAtRisk)}. ${cb.finish} ${pluralizeWorkouts(left)}${cb.tail}`,
      priority: BroPriority.Comeback,
    });
  }

  if (today.isToday && today.isCompleted) {
    const vol = today.completedVolumeKg ?? 0;
    const text = isVolumeRecord
      ? bro.praise.record(formatTonnage(vol))
      : vol > 0
        ? bro.praise.withVolume(formatTonnage(vol))
        : bro.praise.plain;
    list.push({
      id: 'praise',
      category: isVolumeRecord ? bro.praise.recordTitle : bro.praise.title,
      text,
      priority: BroPriority.WorkoutPraise,
    });
  }

  if (
    today.isToday &&
    today.hasWorkout &&
    today.workoutName &&
    !today.isCompleted
  ) {
    const cta = today.isInProgress
      ? { label: bro.workout.continueLabel, onPress: today.onContinue }
      : { label: bro.workout.start, onPress: today.onStart };
    list.push({
      id: 'workout',
      category: bro.workout.title,
      text: bro.workout.text(today.workoutName),
      cta,
      priority: BroPriority.WorkoutHype,
    });
  }

  if (recentAchievement) {
    list.push({
      id: 'achievement',
      category: bro.achievement.title,
      text: bro.achievement.text(
        recentAchievement.emoji,
        recentAchievement.name,
      ),
      priority: BroPriority.Achievement,
    });
  }

  const streak = stats?.streak ?? 0;
  if (STREAK_MILESTONES.has(streak)) {
    list.push({
      id: 'streak',
      category: bro.streakTitle,
      text: `${pluralizeWeeks(streak)} ${bro.streakSuffix}`,
      priority: BroPriority.StreakMilestone,
    });
  }

  if (weeklyGoal) {
    list.push({
      id: 'goal',
      category: bro.goalTitle,
      text: `${weeklyGoal.primary} — ${weeklyGoal.secondary}`,
      priority: BroPriority.WeeklyGoal,
    });
  }

  const state: ConditionState = {
    timeOfDay,
    water,
    user,
    today,
    daysSincePause,
    showPro,
  };
  for (const p of phrases) {
    if (p.condition === 'always') continue;
    if (conditionMet(p.condition, state))
      list.push(phraseToMessage(p, today, onNavigatePrograms, onShowProInfo));
  }

  const pool = phrases.filter((p) => p.condition === 'always');
  if (pool.length) {
    const p = pool[Math.floor(speechSeed * pool.length) % pool.length];
    list.push({
      ...phraseToMessage(p, today, onNavigatePrograms, onShowProInfo),
      id: 'speech',
      priority: 0,
    });
  }

  return list.sort((a, b) => b.priority - a.priority);
}
