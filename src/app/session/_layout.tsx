import { Redirect, Stack } from 'expo-router';

import { COLORS } from '@/theme';
import { ROUTES } from '@/utils/constants/routes';
import { useAuthStore } from '@/store/auth';
import { useSessionStore } from '@/store/session';

export default function SessionLayout() {
  const status = useAuthStore((s) => s.status);
  const hasActiveSession = useSessionStore((s) => s.active !== null);

  if (status === 'signedOut') return <Redirect href={ROUTES.authEmail} />;
  if (!hasActiveSession) return <Redirect href={ROUTES.home} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: COLORS.Background.primary },
        animation: 'fade',
      }}
    />
  );
}
