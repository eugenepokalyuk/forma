import { apiRequest } from '@/shared/api/apiRequest';
import type { ExerciseCatalogItem } from '../models/exerciseCatalog';

export function getExerciseCatalogApi() {
  return apiRequest<ExerciseCatalogItem[]>({
    method: 'get',
    url: '/exercise-catalog',
  });
}
