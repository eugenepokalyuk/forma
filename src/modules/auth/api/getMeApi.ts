import { apiRequest } from '@/shared/api/apiRequest';
import type { User } from '../models/user';

export function getMeApi() {
  return apiRequest<User>({
    method: 'get',
    url: '/auth/me',
  });
}
