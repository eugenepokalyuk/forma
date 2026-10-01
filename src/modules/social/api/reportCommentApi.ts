import { apiRequest } from '@/shared/api/apiRequest';
import type { ReportReason } from '../models/social';

export function reportCommentApi(
  postId: string,
  commentId: string,
  reason: ReportReason,
) {
  return apiRequest({
    method: 'post',
    url: `/social/posts/${postId}/comments/${commentId}/report`,
    data: { reason },
  });
}
