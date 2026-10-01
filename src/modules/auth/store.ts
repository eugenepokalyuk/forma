import { create } from 'zustand';

import { getMeApi } from './api/getMeApi';
import { setUnauthorizedHandler } from '@/shared/api/unauthorized';
import type { User } from './models/user';
import {
  clearToken,
  getToken,
  setToken,
} from '@/shared/lib/storage/tokenStore';
import { useOutboxStore } from '@/modules/workout';

interface AuthState {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: User | null;
  bootstrap: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

// Разделение состояния: серверные данные — только react-query
// (queries.ts модулей), в zustand — то, что живёт на устройстве: статус
// авторизации, активная тренировка и очередь синхронизации (modules/workout).
// Сценарии поверх API — в services модулей.
export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  bootstrap: async () => {
    const token = await getToken();
    if (!token) {
      set({ status: 'signedOut', user: null });
      return;
    }
    // Проверка токена при старте — только если есть сеть; offline —
    // считаем сессию валидной до первого 401 (см. onUnauthorized ниже).
    try {
      const user = await getMeApi();
      set({ status: 'signedIn', user });
    } catch {
      set({ status: 'signedIn', user: null });
    }
  },

  signIn: async (token, user) => {
    await setToken(token);
    useOutboxStore.getState().setPaused(false);
    set({ status: 'signedIn', user });
  },

  signOut: async () => {
    await clearToken();
    set({ status: 'signedOut', user: null });
  },

  setUser: (user) => set({ user }),
}));

setUnauthorizedHandler(() => {
  useAuthStore.setState({ status: 'signedOut', user: null });
});
