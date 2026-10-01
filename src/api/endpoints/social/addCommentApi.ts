import { apiRequest } from '@/api/request/apiRequest';
import type { Comment } from '@/api/models';

export function addCommentApi(postId: string, text: string) {
  return apiRequest<Comment>({
    method: 'post',
    url: `/social/posts/${postId}/comments`,
    data: { text },
  });
}
