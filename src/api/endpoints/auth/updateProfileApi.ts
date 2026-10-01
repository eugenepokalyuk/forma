import { apiRequest } from '@/api/request/apiRequest';
import type { User } from '@/api/models';

export function updateProfileApi(data: Partial<Pick<User, 'isPublic'>>) {
  return apiRequest<User>({
    method: 'patch',
    url: '/auth/profile',
    data,
  });
}
