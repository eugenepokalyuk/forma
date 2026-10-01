import { Alert } from 'react-native';

// Действие не дошло до сервера — говорим об этом, а не молчим.
// action — что не получилось, в инфинитиве: «подписаться», «отправить комментарий».
export function alertActionFailed(action: string) {
  Alert.alert(
    `Не удалось ${action}`,
    'Проверьте подключение к интернету и попробуйте ещё раз',
  );
}
