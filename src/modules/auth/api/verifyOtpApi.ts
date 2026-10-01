import { apiRequest } from '@/shared/api/apiRequest';
import type { VerifyOtpResponse } from '../models/user';

export function verifyOtpApi(email: string, code: string) {
  return apiRequest<VerifyOtpResponse>({
    method: 'post',
    url: '/auth/verify-otp',
    data: { email, code },
  });
}
