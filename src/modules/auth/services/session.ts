import { adoptWorkoutData, resetWorkoutData } from '@/modules/workout';
import {
  clearToken,
  getToken,
  setToken,
} from '@/shared/lib/storage/tokenStore';

import { deleteAccountApi } from '../api/deleteAccountApi';
import { getMeApi } from '../api/getMeApi';
import type { User } from '../models/user';
import { useAuthStore } from '../store';

export async function bootstrap() {
  const { setSignedIn, setSignedOut } = useAuthStore.getState();
  const token = await getToken();
  if (!token) {
    setSignedOut();
    return;
  }
  // Проверка токена при старте — только если есть сеть; offline —
  // считаем сессию валидной до первого 401 (см. store.ts).
  try {
    const user = await getMeApi();
    adoptWorkoutData(user.id);
    setSignedIn(user);
  } catch {
    setSignedIn(null);
  }
}

export async function signIn(token: string, user: User) {
  await setToken(token);
  adoptWorkoutData(user.id);
  useAuthStore.getState().setSignedIn(user);
}

// Выход без вопросов — неотправленные тренировки удаляются. Предупреждение
// показывает useSignOut.
export async function signOut() {
  await clearToken();
  resetWorkoutData();
  useAuthStore.getState().setSignedOut();
}

// Удаление аккаунта на сервере, затем — как выход: локальные данные
// (токен, тренировки, очередь синхронизации) больше не нужны. Неотправленные
// подходы не досылаем — данные аккаунта всё равно удаляются.
export async function deleteAccount() {
  await deleteAccountApi();
  await signOut();
}
