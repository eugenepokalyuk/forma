import { apiRequest } from '@/api/request/apiRequest';
import type { User } from '@/api/models';

export function getMeApi() {
  return apiRequest<User>({
    method: 'get',
    url: '/auth/me',
  });
}
