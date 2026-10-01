import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function getFollowingApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/following',
  });
}
