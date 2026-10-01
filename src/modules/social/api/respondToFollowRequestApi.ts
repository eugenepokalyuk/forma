import { apiRequest } from '@/shared/api/apiRequest';
import type { FollowRequestAction } from '../models/social';

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
