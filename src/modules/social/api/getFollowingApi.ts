import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function getFollowingApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/following',
  });
}
