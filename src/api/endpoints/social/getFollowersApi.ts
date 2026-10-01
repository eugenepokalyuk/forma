import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function getFollowersApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/followers',
  });
}
