import { apiRequest } from '@/shared/api/apiRequest';

export function sendOtpApi(email: string) {
  return apiRequest<void>({
    method: 'post',
    url: '/auth/send-otp',
    data: { email },
  });
}
