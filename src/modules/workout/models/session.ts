import type { ExerciseType, WorkoutWithExercises } from '@/modules/programs';

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
