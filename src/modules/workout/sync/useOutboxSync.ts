import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import { AppState } from 'react-native';

import { processOutbox } from './processOutbox';

const TICK_MS = 30_000;

// Запуск обработчика очереди: старт приложения, таймер (с учётом backoff),
// переход NetInfo в online и возврат приложения из фона (сразу, без
// ожидания backoff). Новые операции запускают обработку сами — см.
// services/workout.ts.
export function useOutboxSync() {
  React.useEffect(() => {
    void processOutbox({ force: true });

    const netSub = NetInfo.addEventListener((state) => {
      if (state.isConnected) void processOutbox({ force: true });
    });

    const appSub = AppState.addEventListener('change', (status) => {
      if (status === 'active') void processOutbox({ force: true });
    });

    const interval = setInterval(() => void processOutbox(), TICK_MS);

    return () => {
      netSub();
      appSub.remove();
      clearInterval(interval);
    };
  }, []);
}
