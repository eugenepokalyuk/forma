import { Redirect } from 'expo-router';

import { ROUTES } from '@/utils/routes';
import { useAuthStore } from '@/store/auth';
import { useSessionStore } from '@/store/session';

// Если при запуске есть незавершённая локальная сессия, приложение сразу
// открывает режим выполнения.
export default function Index() {
  const status = useAuthStore((s) => s.status);
  const hasActiveSession = useSessionStore((s) => s.active !== null);

  if (status === 'signedOut') return <Redirect href={ROUTES.authEmail} />;

  if (hasActiveSession) return <Redirect href={ROUTES.sessionActive} />;

  return <Redirect href={ROUTES.home} />;
}
