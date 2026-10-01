import { apiRequest } from '@/api/request/apiRequest';
import type { Post } from '@/api/models';

export function unlikePostApi(postId: string) {
  return apiRequest<Post>({
    method: 'delete',
    url: `/social/posts/${postId}/like`,
  });
}
