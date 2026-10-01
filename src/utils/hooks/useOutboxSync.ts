import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import { AppState } from 'react-native';

import { processOutbox } from '@/store/outbox';

// Запуск обработчика очереди: добавление операции (см. store/session и
// store/outbox), переход NetInfo в online, возврат приложения из фона,
// таймер раз в 30 секунд.
export function useOutboxSync() {
  React.useEffect(() => {
    void processOutbox();

    const netSub = NetInfo.addEventListener((state) => {
      if (state.isConnected) void processOutbox();
    });

    const appSub = AppState.addEventListener('change', (status) => {
      if (status === 'active') void processOutbox();
    });

    const interval = setInterval(() => {
      void processOutbox();
    }, 30_000);

    return () => {
      netSub();
      appSub.remove();
      clearInterval(interval);
    };
  }, []);
}
