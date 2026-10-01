import { apiRequest } from '@/api/request/apiRequest';
import type { FollowRequestItem } from '@/api/models';

export function getFollowRequestsApi() {
  return apiRequest<FollowRequestItem[]>({
    method: 'get',
    url: '/social/requests',
  });
}
