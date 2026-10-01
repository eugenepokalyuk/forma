import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function unblockUserApi(publicId: string) {
  return apiRequest<PublicUser>({
    method: 'delete',
    url: `/social/users/${publicId}/block`,
  });
}
