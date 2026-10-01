import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function followUserApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'post',
    url: `/social/users/${publicId}/follow`,
  });
}
