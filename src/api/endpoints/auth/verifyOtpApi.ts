import { apiRequest } from '@/api/request/apiRequest';
import type { VerifyOtpResponse } from '@/api/models';

export function verifyOtpApi(email: string, code: string) {
  return apiRequest<VerifyOtpResponse>({
    method: 'post',
    url: '/auth/verify-otp',
    data: { email, code },
  });
}
