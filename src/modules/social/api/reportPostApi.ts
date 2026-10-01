import { apiRequest } from '@/shared/api/apiRequest';
import type { ReportReason } from '../models/social';

export function reportPostApi(postId: string, reason: ReportReason) {
  return apiRequest({
    method: 'post',
    url: `/social/posts/${postId}/report`,
    data: { reason },
  });
}
