import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function getPublicProfileApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'get',
    url: `/social/users/${publicId}`,
  });
}
