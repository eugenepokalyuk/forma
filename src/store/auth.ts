import { create } from 'zustand';

import { getMeApi, setUnauthorizedHandler } from '@/api';
import type { User } from '@/api';
import { clearToken, getToken, setToken } from '@/utils/storage/tokenStore';
import { useOutboxStore } from '@/store/outbox';

interface AuthState {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: User | null;
  bootstrap: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

// TODO: Ох, как мне не нравится текующая работа с бизнес логикой. Не хватает стейт менеджера, давай обсудим возможные варианты для данного приложения
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
