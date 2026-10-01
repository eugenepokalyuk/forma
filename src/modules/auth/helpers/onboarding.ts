import type { User } from '../models/user';

// Порт forma-next/src/utils/onboarding.ts — поля, которые считаем
// обязательными для «полного» профиля (условие «onboarding» у Фитнес Бро).
const ONBOARDING_FIELDS = [
  'height',
  'weight',
  'goal',
  'dateOfBirth',
  'gender',
  'fitnessExperience',
  'workoutFrequency',
  'workoutDuration',
  'trainingPlace',
] as const;

export function isOnboardingComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  return ONBOARDING_FIELDS.every((field) => {
    const value = user[field];
    return value !== null && value !== undefined && value !== '';
  });
}
