import {
  SofiaSansExtraCondensed_600SemiBold,
  SofiaSansExtraCondensed_700Bold,
  SofiaSansExtraCondensed_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/sofia-sans-extra-condensed';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View } from 'react-native';

import { COLORS } from '@/theme';
import { queryClient, queryPersister } from '@/utils/query/queryClient';
import { useOutboxSync } from '@/utils/hooks/useOutboxSync';
import { useAuthStore } from '@/store/auth';
import { useSessionStore } from '@/store/session';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [authReady, setAuthReady] = React.useState(false);
  // Загружаем шрифт заголовков ДО показа контента — иначе на холодном
  // старте был бы виден системный шрифт с последующим «скачком» раскладки,
  // когда Sofia Sans догрузится и заголовки поменяют размер строки.
  const [fontsLoaded] = useFonts({
    SofiaSansExtraCondensed_600SemiBold,
    SofiaSansExtraCondensed_700Bold,
    SofiaSansExtraCondensed_800ExtraBold,
  });
  // Незавершённая локальная сессия должна восстановиться из MMKV ДО того,
  // как index.tsx решит, куда редиректить — иначе на холодном старте
  // мелькнёт «Мои программы» перед возвратом в режим выполнения.
  const [sessionHydrated, setSessionHydrated] = React.useState(
    useSessionStore.persist.hasHydrated(),
  );
  const ready = authReady && sessionHydrated && fontsLoaded;

  useOutboxSync();

  React.useEffect(() => {
    bootstrap().finally(() => setAuthReady(true));
  }, [bootstrap]);

  React.useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) {
      setSessionHydrated(true);
      return;
    }

    return useSessionStore.persist.onFinishHydration(() =>
      setSessionHydrated(true),
    );
  }, []);

  React.useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready || status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.Background.primary }} />
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister }}
    >
      <StatusBar style="light" />
      <Slot />
    </PersistQueryClientProvider>
  );
}
