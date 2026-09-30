import axios from 'axios';

import { clearToken, getToken } from '@/utils/tokenStore';

// TODO: Посмотри как правильно храняться апи запросы в соседнем проекте face хочу также прийти в подобному решению в данном проекте

// Прод — forma-one.ru, локально — LAN-IP бэкенда (CORS мобайлу не нужен,
// т.к. запросы не из браузера). Задаётся через EXPO_PUBLIC_API_URL в .env.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://forma-one.ru/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Слушатели на 401 — выход из аккаунта (см. auth-гейт в _layout).
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
