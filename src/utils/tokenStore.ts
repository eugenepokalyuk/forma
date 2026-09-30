import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'forma.accessToken';

// Keychain (iOS) / Keystore (Android) вместо httpOnly-cookie из веба —
// токен живёт вне JS-контекста, но клиент сам подставляет его в заголовок
// (мобайл ходит в Django напрямую, без Next.js-прокси).
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
