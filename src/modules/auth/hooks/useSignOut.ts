import * as React from 'react';
import { Alert } from 'react-native';

import { getPendingSyncCount } from '@/modules/workout';

import { signOut, signOutGuest } from '../services/session';
import { useAuthStore } from '../store';

// Выход с предупреждением, если в очереди есть неотправленные данные
// тренировок: после выхода они будут удалены. Гость вернуться не сможет —
// предупреждаем всегда, а аккаунт удаляем (signOutGuest).
export function useSignOut() {
  const isGuest = useAuthStore((s) => !!s.user?.isGuest);

  return React.useCallback(() => {
    if (isGuest) {
      Alert.alert(
        'Выйти из гостевого режима?',
        'Войти в этот аккаунт снова не получится: программы, тренировки и прогресс будут удалены безвозвратно. Чтобы их сохранить, привяжите почту или войдите в свой аккаунт из профиля',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Выйти и удалить',
            style: 'destructive',
            onPress: () => void signOutGuest(),
          },
        ],
      );
      return;
    }

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
  }, [isGuest]);
}
