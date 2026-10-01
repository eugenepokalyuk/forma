import * as React from 'react';
import { Alert } from 'react-native';

import { getPendingSyncCount } from '@/modules/workout';

import { signOut } from '../services/session';

// Выход с предупреждением, если в очереди есть неотправленные данные
// тренировок: после выхода они будут удалены.
export function useSignOut() {
  return React.useCallback(() => {
    const pending = getPendingSyncCount();
    if (pending === 0) {
      void signOut();
      return;
    }

    Alert.alert(
      'Данные не синхронизированы',
      `Изменений тренировок, не отправленных на сервер: ${pending}. Если выйти сейчас, они будут потеряны. Подключитесь к интернету и дождитесь синхронизации.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти и удалить',
          style: 'destructive',
          onPress: () => void signOut(),
        },
      ],
    );
  }, []);
}
