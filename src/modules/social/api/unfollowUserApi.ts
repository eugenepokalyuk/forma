import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function unfollowUserApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'delete',
    url: `/social/users/${publicId}/follow`,
  });
}
