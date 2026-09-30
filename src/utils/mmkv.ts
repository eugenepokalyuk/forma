import { MMKV } from 'react-native-mmkv';

// Одно хранилище на всё: кэш TanStack Query, Zustand-стор активной сессии,
// outbox. Токен сюда не кладём — он в expo-secure-store (Keychain/Keystore).
export const storage = new MMKV({ id: 'forma' });

export const mmkvStorageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
