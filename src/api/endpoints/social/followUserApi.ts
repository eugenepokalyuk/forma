import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function followUserApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'post',
    url: `/social/users/${publicId}/follow`,
  });
}
