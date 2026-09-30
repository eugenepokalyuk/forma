import { Redirect, Stack } from 'expo-router';

import { COLORS } from '@/theme';
import { ROUTES } from '@/utils/routes';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);
  if (status === 'signedIn') return <Redirect href={ROUTES.home} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.Background.primary },
      }}
    >
      <Stack.Screen name="email" />
      <Stack.Screen name="code" />
    </Stack>
  );
}
