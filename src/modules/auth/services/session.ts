import {
  adoptWorkoutData,
  pauseWorkoutSync,
  resetWorkoutData,
  transferWorkoutData,
} from '@/modules/workout';
import { queryClient } from '@/shared/lib/queryClient';
import {
  clearToken,
  getToken,
  setToken,
} from '@/shared/lib/storage/tokenStore';

import { deleteAccountApi } from '../api/deleteAccountApi';
import { setMonitoringUser } from '@/shared/lib/monitoring';

import { getMeApi } from '../api/getMeApi';
import { claimGuestApi, signInAsGuestApi } from '../api/guestApi';
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
    setMonitoringUser(user.id);
    setSignedIn(user);
  } catch {
    setSignedIn(null);
  }
}

export async function signIn(token: string, user: User) {
  await setToken(token);
  adoptWorkoutData(user.id);
  setMonitoringUser(user.id);
  useAuthStore.getState().setSignedIn(user);
}

// Гостевой вход: аккаунт без почты, дальше — как обычный вход.
export async function signInAsGuest() {
  const res = await signInAsGuestApi();
  await signIn(res.accessToken, res.user);
}

// Вход гостя по почте. Почта свободна — пользователь тот же, меняется только
// токен. У почты есть аккаунт — сервер перенёс данные гостя туда с теми же
// id, поэтому очередь и активную тренировку передаём аккаунту, а не
// сбрасываем, и перезапрашиваем кэш: в нём данные одного гостя.
export async function claimGuest(email: string, code: string) {
  const guestId = useAuthStore.getState().user?.id;
  pauseWorkoutSync(true);
  let res;
  try {
    res = await claimGuestApi(email, code);
  } catch (e) {
    pauseWorkoutSync(false);
    throw e;
  }
  const merged = res.user.id !== guestId;
  if (merged) transferWorkoutData(res.user.id);
  await signIn(res.accessToken, res.user);
  if (merged) void queryClient.invalidateQueries();
  return { merged };
}

// Выход гостя: войти обратно он не сможет, поэтому аккаунт удаляем. Без сети
// удаление не пройдёт — всё равно выходим, аккаунт останется на сервере
// без владельца.
export async function signOutGuest() {
  try {
    await deleteAccountApi();
  } catch {
    // см. выше
  }
  await signOut();
}

// Выход без вопросов — неотправленные тренировки удаляются. Предупреждение
// показывает useSignOut.
export async function signOut() {
  await clearToken();
  resetWorkoutData();
  setMonitoringUser(null);
  useAuthStore.getState().setSignedOut();
}

// Удаление аккаунта на сервере, затем — как выход: локальные данные
// (токен, тренировки, очередь синхронизации) больше не нужны. Неотправленные
// подходы не досылаем — данные аккаунта всё равно удаляются.
export async function deleteAccount() {
  await deleteAccountApi();
  await signOut();
}
