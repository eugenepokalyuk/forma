import { Alert, Linking } from 'react-native';

import { PRO_SUBSCRIPTION_URL } from '@/shared/constants/links';

import { useAuthStore } from '../store';

// ПРО оформляется на сайте: объясняем и даём перейти туда одной кнопкой.
// Гостю на сайт войти нечем — сначала нужна почта.
export function showProInfo() {
  if (useAuthStore.getState().user?.isGuest) {
    Alert.alert(
      'ПРО доступен на сайте',
      'Подписка оформляется на forma-one.ru по почте. Сначала привяжите почту в профиле — прогресс при этом сохранится.',
    );
    return;
  }

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
