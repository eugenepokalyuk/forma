import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function unfollowUserApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'delete',
    url: `/social/users/${publicId}/follow`,
  });
}
