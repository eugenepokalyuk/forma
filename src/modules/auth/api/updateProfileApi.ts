import { apiRequest } from '@/shared/api/apiRequest';
import type { User } from '../models/user';

export function updateProfileApi(data: Partial<Pick<User, 'isPublic'>>) {
  return apiRequest<User>({
    method: 'patch',
    url: '/auth/profile',
    data,
  });
}
