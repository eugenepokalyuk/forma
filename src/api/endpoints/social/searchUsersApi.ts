import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function searchUsersApi(q: string) {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/search',
    params: { q },
  });
}
