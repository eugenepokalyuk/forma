import { apiRequest } from '@/shared/api/apiRequest';
import type { FollowRequestItem } from '../models/social';

export function getFollowRequestsApi() {
  return apiRequest<FollowRequestItem[]>({
    method: 'get',
    url: '/social/requests',
  });
}
