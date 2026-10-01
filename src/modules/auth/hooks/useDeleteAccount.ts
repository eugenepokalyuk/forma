import * as React from 'react';
import { Alert } from 'react-native';

import { alertActionFailed } from '@/shared/ui/alertActionFailed';

import { deleteAccount } from '../services/session';

// Удаление аккаунта с подтверждением. Возвращает запуск и флаг процесса.
export function useDeleteAccount() {
  const [deleting, setDeleting] = React.useState(false);

  const run = React.useCallback(async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      alertActionFailed('удалить аккаунт');
    } finally {
      setDeleting(false);
    }
  }, []);

  const confirm = React.useCallback(() => {
    Alert.alert(
      'Удалить аккаунт?',
      'Профиль, тренировки, замеры, посты, комментарии и подписки будут удалены безвозвратно. Автопродление ПРО отключится. Платёжные документы хранятся, как того требует закон.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => void run(),
        },
      ],
    );
  }, [run]);

  return { confirm, deleting };
}
