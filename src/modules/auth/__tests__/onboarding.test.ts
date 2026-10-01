import { isOnboardingComplete } from '../helpers/onboarding';
import type { User } from '../models/user';

const complete: User = {
  id: 'u1',
  email: 'a@b.c',
  name: 'Аня',
  hasProAccess: false,
  avatarUrl: null,
  height: 170,
  weight: 60,
  goal: 'gym',
  dateOfBirth: '1995-01-01',
  gender: 'female',
  fitnessExperience: 'beginner',
  workoutFrequency: 3,
  workoutDuration: 60,
  trainingPlace: 'gym',
};

describe('isOnboardingComplete', () => {
  it('все поля заполнены', () => {
    expect(isOnboardingComplete(complete)).toBe(true);
  });

  it('нет пользователя', () => {
    expect(isOnboardingComplete(null)).toBe(false);
    expect(isOnboardingComplete(undefined)).toBe(false);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['пустая строка', ''],
  ])('поле со значением %s — профиль не заполнен', (_, value) => {
    expect(
      isOnboardingComplete({ ...complete, goal: value as string | null }),
    ).toBe(false);
  });

  it('ноль — заполненное значение, а не пустое', () => {
    expect(isOnboardingComplete({ ...complete, workoutFrequency: 0 })).toBe(
      true,
    );
  });
});
