import { apiRequest } from '@/shared/api/apiRequest';
import type { VerifyOtpResponse } from '../models/user';

// Вход без почты — сервер создаёт гостевой аккаунт с долгоживущим токеном.
export function signInAsGuestApi() {
  return apiRequest<VerifyOtpResponse>({ method: 'post', url: '/auth/guest' });
}

// Вход гостя по почте: код на почту. existing — у почты уже есть аккаунт,
// данные гостя переедут в него.
export function sendGuestOtpApi(email: string) {
  return apiRequest<{ existing: boolean }>({
    method: 'post',
    url: '/auth/guest/send-otp',
    data: { email },
  });
}

// Код верный — гость становится обычным аккаунтом или его данные переезжают
// в существующий; в ответе — тот аккаунт, в который вошли.
export function claimGuestApi(email: string, code: string) {
  return apiRequest<VerifyOtpResponse>({
    method: 'post',
    url: '/auth/guest/claim',
    data: { email, code },
  });
}
