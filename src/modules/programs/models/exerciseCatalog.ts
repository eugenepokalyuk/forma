import type { ExerciseMuscle, ExerciseType } from './program';

// Упражнение глобального каталога (GET /exercise-catalog) — из него выбирают
// замену и новое упражнение во время тренировки.
export interface ExerciseCatalogItem {
  id: string;
  name: string;
  description: string | null;
  additionalInfo: string | null;
  muscles: ExerciseMuscle[];
  equipmentType: string | null;
  exerciseType: ExerciseType;
  videoUrl: string | null;
  imageUrl: string | null;
  // Замены, заданные тренером в админке.
  recommendedReplacementIds: string[];
}
