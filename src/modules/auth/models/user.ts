export interface User {
  id: string;
  email: string;
  name: string;
  hasProAccess: boolean;
  avatarUrl: string | null;
  // Возвращается бэком (см. UserSerializer), но раньше не было нужно на
  // мобиле — нужны для Фитнес Бро (см. modules/bro/helpers/broMessages.ts): часовой пояс для
  // времени суток и заполненность профиля для условия «onboarding».
  showOnboarding?: boolean;
  // Публичный id — тот же, что author.id у постов и комментариев.
  publicId?: string;
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
