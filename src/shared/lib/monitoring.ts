import * as Sentry from '@sentry/react-native';

// Сбор падений и ошибок (Sentry). Включается, только если задан
// EXPO_PUBLIC_SENTRY_DSN и это не сборка для разработки, — без ключа все
// функции ниже ничего не делают. Персональные данные (email, IP) не
// отправляем: только технический id пользователя.
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const enabled = !!DSN && !__DEV__;

export function initMonitoring() {
  if (!enabled) return;
  Sentry.init({
    dsn: DSN,
    sendDefaultPii: false,
    // Трассировка производительности пока не нужна — только ошибки.
    tracesSampleRate: 0,
  });
}

export function setMonitoringUser(id: string | null) {
  if (!enabled) return;
  Sentry.setUser(id ? { id } : null);
}

// Ошибка, которую поймали и обработали, но о ней нужно знать.
export function reportError(error: unknown, extra?: Record<string, unknown>) {
  if (!enabled) return;
  Sentry.captureException(error, { extra });
}

// Не исключение, а ситуация, требующая внимания.
export function reportWarning(
  message: string,
  extra?: Record<string, unknown>,
) {
  if (!enabled) return;
  Sentry.captureMessage(message, { level: 'warning', extra });
}
