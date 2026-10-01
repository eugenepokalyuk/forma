export type ExerciseType =
  'strength' | 'cardio' | 'bodyweight' | 'band' | 'stretch' | 'yoga';

export type SubscriptionTier = 'free' | 'pro';

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
