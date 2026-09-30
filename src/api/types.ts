// Типы отражают camelCase-ответы Django (djangorestframework-camel-case).
// id программ/тренировок/сессий — 8-символьный short_id (строка).
// id упражнения — UUID (именно его шлём в логи подходов).

export type ExerciseType =
  'strength' | 'cardio' | 'bodyweight' | 'band' | 'stretch' | 'yoga';

export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  hasProAccess: boolean;
  avatarUrl: string | null;
  // Возвращается бэком (см. UserSerializer), но раньше не было нужно на
  // мобиле — нужны для Фитнес Бро (см. src/utils/bro.ts): часовой пояс для
  // времени суток и заполненность профиля для условия «onboarding».
  showOnboarding?: boolean;
  timezone?: string;
  height?: number | null;
  weight?: number | null;
  goal?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  fitnessExperience?: string | null;
  workoutFrequency?: number | null;
  workoutDuration?: number | null;
  trainingPlace?: string | null;
  isPublic?: boolean;
}

export interface VerifyOtpResponse {
  accessToken: string;
  user: User;
}

export interface ExerciseMuscle {
  name: string;
  group: string;
  role: 'primary' | 'secondary';
  region: string | null;
}

export interface Exercise {
  id: string; // UUID — используется в логах подходов
  shortId: string;
  catalogExerciseId: string | null;
  name: string;
  exerciseType: ExerciseType;
  description: string | null;
  additionalInfo: string | null;
  muscles: ExerciseMuscle[];
  sets: number;
  repsMin: number | null;
  repsMax: number | null;
  durationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
  orderIndex: number;
  supersetGroup: number | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  isCustom: boolean;
}

export interface WorkoutSummary {
  id: string; // short_id
  name: string;
  dayNumber: number;
  weekNumber: number;
  exercisesCount?: number;
}

export interface WorkoutWithExercises extends WorkoutSummary {
  exercises: Exercise[];
}

export interface ProgramWeek {
  weekNumber: number;
  intensity: 'light' | 'medium' | 'heavy' | null;
  intensityLabel: string | null;
}

export type ProgramCatalogLayout = 'preview' | 'wide' | 'medium';

export interface Program {
  id: string; // short_id
  title: string;
  description: string | null;
  goal: string | null;
  goalLabel: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  daysPerWeek: number;
  tier: SubscriptionTier;
  isPersonal: boolean;
  catalogLayout: ProgramCatalogLayout;
  coverImageUrl: string | null;
  likesCount: number;
  isLiked: boolean;
  reactionCounts: Record<string, number>;
  createdAt: string;
}

export interface ProgramWithWorkoutSummary extends Program {
  weeks: ProgramWeek[];
  workouts: WorkoutSummary[];
}

export interface ProgramWithWorkouts extends Program {
  workoutsDetailCount: number;
  weeks: ProgramWeek[];
  workouts: WorkoutWithExercises[];
}

export interface UserProgram {
  id: string;
  programId: string;
  isActive: boolean;
  position: number;
  startedAt: string;
  program: Program;
}

export type SessionStatus = 'in_progress' | 'completed';

export interface LastLog {
  sessionId: string;
  sessionDate: string;
  setNumber: number;
  weight: number | null;
  repsDone: number | null;
  durationSeconds: number | null;
}

export interface ExerciseLog {
  id: string;
  clientId: string | null;
  exerciseId: string;
  setNumber: number;
  repsDone: number | null;
  weight: number | null;
  durationSeconds: number | null;
  skipped: boolean;
  notes: string | null;
  loggedAt: string;
  actualCatalogExerciseId: string | null;
  actualExercise: {
    name: string;
    thumbnailUrl: string | null;
    exerciseType: ExerciseType;
  } | null;
}

export interface Session {
  id: string; // short_id
  workoutId: string;
  programId: string;
  status: SessionStatus;
  reaction: string | null;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  exerciseLogs: ExerciseLog[];
}

export interface SessionWithWorkout extends Session {
  workout: WorkoutWithExercises;
  hasPost: boolean;
}

export interface SessionStart extends SessionWithWorkout {
  lastLogs: Record<string, LastLog[]>;
  exerciseNotes: Record<string, string>;
}

export interface SessionCompleteResponse extends Session {
  counted: boolean;
  newRecords?: { exercise: string; weight: number }[];
  newAchievements?: unknown[];
}

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  hasProAccess: boolean;
}

export interface PublicUser {
  id: string; // public_id
  name: string;
  email: string;
  avatarUrl: string | null;
  isPublic: boolean;
  hasProAccess: boolean;
  followersCount: number;
  followingCount: number;
  isSelf: boolean;
  isFollowing: boolean;
  isRequested: boolean;
}

export interface FollowRequestItem {
  id: string;
  follower: PublicUser;
  createdAt: string;
}

export interface SocialSummary {
  pendingRequests: number;
}

export type FollowRequestAction = 'accept' | 'reject';

export interface PostExercise {
  name: string;
  thumbnailUrl: string | null;
  /** Каждый подход детально: ["40 кг × 12", "45 кг × 10"] или ["5 мин"]. */
  sets: string[];
}

export interface Comment {
  id: string;
  author: PostAuthor;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title: string;
  /** Первое фото (совместимость). Для карусели — photos. */
  photoUrl: string | null;
  photos: string[];
  durationSeconds: number;
  /** Тоннаж, кг (строка — DRF Decimal). */
  volumeKg: string;
  exercises: PostExercise[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

export type BroCondition =
  | 'always'
  | 'morning'
  | 'water_low'
  | 'workout_today'
  | 'rest_day'
  | 'onboarding'
  | 'return_after_pause'
  | 'pro_promo';

export type BroAction =
  | 'none'
  | 'water'
  | 'onboarding'
  | 'workout'
  | 'subscription'
  | 'achievements'
  | 'programs';

export interface BroPhrase {
  id: number;
  category: string;
  categoryLabel: string;
  text: string;
  title: string;
  condition: BroCondition;
  action: BroAction;
  actionLabel: string;
  priority: number;
}

// См. forma-python/forma (StatsRoute.Stats) и forma-next stats.types.ts.
export interface ComebackState {
  active: boolean;
  streakAtRisk: number;
  daysNeeded: number;
  daysDone: number;
}

export interface UserStats {
  streak: number;
  bestStreak: number;
  streakFrozen: boolean;
  comeback: ComebackState | null;
  weeklyCompletion: number;
  monthlyHours: number;
  weeklyActivity: number[];
  trainedToday: boolean;
}

// См. forma-python/water и forma-next water.types.ts.
export interface WaterLogEntry {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export interface WaterToday {
  date: string;
  goalMl: number;
  baseGoalMl: number;
  consumedMl: number;
  logs: WaterLogEntry[];
}

// См. forma-python/achievements и forma-next achievements.types.ts.
export interface AchievementTier {
  rank: number;
  title: string;
  threshold: number;
  bonus: number;
  earned: boolean;
  earnedAt: string | null;
}

export interface Achievement {
  metric: string;
  name: string;
  description: string;
  emoji: string;
  value: number;
  currentRank: number;
  maxRank: number;
  nextThreshold: number | null;
  tiers: AchievementTier[];
}

export interface AchievementsResponse {
  formBonus: number;
  earnedCount: number;
  achievements: Achievement[];
}

// См. forma-python/programs (ReactionTypeListView) — те же 4 реакции на
// программу/сессию, что и на сайте (см. ProgramCard).
export type ReactionValue = 'fire' | 'liked' | 'meh' | 'hard';

export interface ReactionType {
  value: ReactionValue;
  label: string;
  emoji: string;
  order: number;
}

export interface ApiErrorBody {
  detail?: string;
  [field: string]: unknown;
}
