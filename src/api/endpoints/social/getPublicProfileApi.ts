import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function getPublicProfileApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'get',
    url: `/social/users/${publicId}`,
  });
}
