import { apiRequest } from '@/api/request/apiRequest';
import type { Comment } from '@/api/models';

export function getCommentsApi(postId: string) {
  return apiRequest<Comment[]>({
    method: 'get',
    url: `/social/posts/${postId}/comments`,
  });
}
