import {
  SofiaSansExtraCondensed_600SemiBold,
  SofiaSansExtraCondensed_700Bold,
  SofiaSansExtraCondensed_700Bold_Italic,
  SofiaSansExtraCondensed_800ExtraBold,
  SofiaSansExtraCondensed_800ExtraBold_Italic,
  useFonts,
} from '@expo-google-fonts/sofia-sans-extra-condensed';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { COLORS } from '@/theme';
import { Toaster } from '@/shared/ui';
import { queryClient, queryPersister } from '@/shared/lib/queryClient';
import { useOutboxSync, useSessionStore } from '@/modules/workout';
import { SyncProgressBar } from '@/modules/workout/ui';
import { initMonitoring } from '@/shared/lib/monitoring';
import { bootstrap, useAuthStore } from '@/modules/auth';

initMonitoring();
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const [authReady, setAuthReady] = React.useState(false);
  // Загружаем шрифт заголовков ДО показа контента — иначе на холодном
  // старте был бы виден системный шрифт с последующим «скачком» раскладки,
  // когда Sofia Sans догрузится и заголовки поменяют размер строки.
  const [fontsLoaded] = useFonts({
    SofiaSansExtraCondensed_600SemiBold,
    SofiaSansExtraCondensed_700Bold,
    SofiaSansExtraCondensed_800ExtraBold,
    // Курсив — для бейджей «ПРО».
    SofiaSansExtraCondensed_700Bold_Italic,
    SofiaSansExtraCondensed_800ExtraBold_Italic,
  });
  // Незавершённая локальная сессия должна восстановиться из MMKV ДО того,
  // как index.tsx решит, куда редиректить — иначе на холодном старте
  // мелькнёт «Мои программы» перед возвратом в режим выполнения.
  const sessionHydrated = React.useSyncExternalStore(
    useSessionStore.persist.onFinishHydration,
    useSessionStore.persist.hasHydrated,
  );
  const ready = authReady && sessionHydrated && fontsLoaded;

  useOutboxSync();

  React.useEffect(() => {
    bootstrap().finally(() => setAuthReady(true));
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
    // KeyboardProvider — высота клавиатуры для KeyboardAvoidingView на обеих
    // платформах, в том числе внутри Modal на Android (edge-to-edge: система
    // окно под клавиатуру не поджимает).
    <KeyboardProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister }}
      >
        <StatusBar style="light" />
        <Slot />
        <SyncProgressBar />
        <Toaster />
      </PersistQueryClientProvider>
    </KeyboardProvider>
  );
}
