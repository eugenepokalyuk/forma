import { Redirect, Stack } from 'expo-router';

import { COLORS } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/modules/auth';
import { useSessionStore } from '@/modules/workout';

export default function AppLayout() {
  const status = useAuthStore((s) => s.status);
  const hasActiveSession = useSessionStore((s) => s.active !== null);

  if (status === 'signedOut') return <Redirect href={ROUTES.authEmail} />;
  if (hasActiveSession) return <Redirect href={ROUTES.sessionActive} />;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.Background.primary },
        headerTintColor: COLORS.Text.primary,
        headerShadowVisible: false,
        // У кнопки «назад» — только шеврон, без текста. По умолчанию она
        // наследует заголовок предыдущего экрана, из-за чего сверху иногда
        // мелькало не то название. Заголовок самого экрана остаётся —
        // его задаёт каждый экран через <Stack.Screen options={{ title }} />.
        headerBackButtonDisplayMode: 'minimal',
        headerTitleStyle: { color: COLORS.Text.primary },
        contentStyle: { backgroundColor: COLORS.Background.primary },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="program/[id]" />
      <Stack.Screen name="workout/[id]" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="blocked" />
    </Stack>
  );
}
