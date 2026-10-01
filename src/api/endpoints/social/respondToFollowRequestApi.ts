import { apiRequest } from '@/api/request/apiRequest';
import type { FollowRequestAction } from '@/api/models';

export function respondToFollowRequestApi(
  followId: string,
  action: FollowRequestAction,
) {
  return apiRequest<void>({
    method: 'post',
    url: `/social/requests/${followId}`,
    data: { action },
  });
}
