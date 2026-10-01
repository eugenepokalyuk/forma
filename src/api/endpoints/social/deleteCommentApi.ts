import { apiRequest } from '@/api/request/apiRequest';

export function deleteCommentApi(postId: string, commentId: string) {
  return apiRequest<void>({
    method: 'delete',
    url: `/social/posts/${postId}/comments/${commentId}`,
  });
}
