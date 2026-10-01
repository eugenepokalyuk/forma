import { create } from 'zustand';

import { setUnauthorizedHandler } from '@/shared/api/unauthorized';

import type { User } from './models/user';

// Разделение состояния: серверные данные — только react-query
// (queries.ts модулей), в zustand — то, что живёт на устройстве: статус
// авторизации, активная тренировка и очередь синхронизации (modules/workout).
// Сценарии (вход, выход, проверка токена) — в services/session.ts.

interface AuthState {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: User | null;
  setSignedIn: (user: User | null) => void;
  setSignedOut: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  setSignedIn: (user) => set({ status: 'signedIn', user }),
  setSignedOut: () => set({ status: 'signedOut', user: null }),
  setUser: (user) => set({ user }),
}));

// 401 от API — сессия истекла. Очередь тренировок при этом не трогаем:
// она на паузе и продолжит отправку после повторного входа того же
// пользователя (см. adoptWorkoutData).
setUnauthorizedHandler(() => useAuthStore.getState().setSignedOut());
