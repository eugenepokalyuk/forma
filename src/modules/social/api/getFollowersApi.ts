import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function getFollowersApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/followers',
  });
}
