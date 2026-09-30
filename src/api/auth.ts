import { apiClient } from '@/api/client';
import type { User, VerifyOtpResponse } from '@/api/types';

export function sendOtp(email: string) {
  return apiClient.post<void>('/auth/send-otp', { email });
}

export function verifyOtp(email: string, code: string) {
  return apiClient.post<VerifyOtpResponse>('/auth/verify-otp', { email, code });
}

export function fetchMe() {
  return apiClient.get<User>('/auth/me').then((res) => res.data);
}

export function updateProfile(data: Partial<Pick<User, 'isPublic'>>) {
  return apiClient.patch<User>('/auth/profile', data).then((res) => res.data);
}
