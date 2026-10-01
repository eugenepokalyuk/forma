import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function searchUsersApi(q: string) {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/search',
    params: { q },
  });
}
