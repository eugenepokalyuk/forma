// Прод — forma-one.ru, локально — LAN-IP бэкенда (CORS мобайлу не нужен,
// т.к. запросы не из браузера). Задаётся через EXPO_PUBLIC_API_URL в .env.
export function getApiBase() {
  return process.env.EXPO_PUBLIC_API_URL ?? 'https://forma-one.ru/api/v1';
}
