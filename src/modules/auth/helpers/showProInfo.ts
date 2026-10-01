import { Alert, Linking } from 'react-native';

import { PRO_SUBSCRIPTION_URL } from '@/shared/constants/links';

// ПРО оформляется на сайте: объясняем и даём перейти туда одной кнопкой.
export function showProInfo() {
  Alert.alert(
    'ПРО доступен на сайте',
    'Оформить подписку можно на forma-one.ru — войдите там в тот же аккаунт.',
    [
      { text: 'OK', style: 'cancel' },
      {
        text: 'Перейти на сайт',
        onPress: () => void Linking.openURL(PRO_SUBSCRIPTION_URL),
      },
    ],
  );
}
