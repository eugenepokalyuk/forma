import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { mmkvStorageAdapter } from '@/utils/storage/mmkv';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Кэш программ переживает перезапуск, stale-while-revalidate из коробки.
      staleTime: 60_000,
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 дней — см. раздел Offline
      retry: 1,
    },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: mmkvStorageAdapter,
  key: 'forma.queryCache',
});
