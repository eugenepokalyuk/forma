import NetInfo from '@react-native-community/netinfo';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  focusManager,
  onlineManager,
  QueryClient,
} from '@tanstack/react-query';
import { AppState } from 'react-native';

import { mmkvStorageAdapter } from '@/shared/lib/storage/mmkv';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Кэш программ переживает перезапуск, stale-while-revalidate из коробки.
      staleTime: 60_000,
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 дней — см. раздел Offline
      retry: 1,
    },
    // Мутации без сети не ждут её, а сразу падают — пользователь видит
    // «Не удалось…» (alertActionFailed), а не вечную крутилку на кнопке.
    // Офлайн-работа тренировки идёт через свою очередь, не через мутации.
    mutations: { networkMode: 'always' },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: mmkvStorageAdapter,
  key: 'forma.queryCache',
});

// В React Native react-query сам не знает ни о сети, ни о возврате в
// приложение. Без этого запрос, упавший офлайн, так и висел ошибкой на
// смонтированной вкладке (профиль) до перезапуска. Теперь офлайн-запросы
// ждут сети, а с её появлением и при возврате из фона устаревшие данные
// перезапрашиваются. Зовётся один раз из корневого layout.
export function connectQueryClientToDevice() {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
  );

  const sub = AppState.addEventListener('change', (status) =>
    focusManager.setFocused(status === 'active'),
  );
  return () => sub.remove();
}
