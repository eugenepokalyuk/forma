import axios, { type AxiosRequestConfig } from 'axios';

import { clearToken, getToken } from '@/utils/storage/tokenStore';

import { getApiBase } from './helpers/getApiBase';
import { notifyUnauthorized } from './unauthorized';

const client = axios.create({
  baseURL: getApiBase(),
  timeout: 10_000,
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

// Единая точка запросов к API: возвращает сразу тело ответа.
export function apiRequest<R = void>(config: AxiosRequestConfig): Promise<R> {
  return client.request<R>(config).then((res) => res.data);
}
