import { apiRequest } from '@/api/request/apiRequest';
import type { Post } from '@/api/models';

export function likePostApi(postId: string) {
  return apiRequest<Post>({
    method: 'post',
    url: `/social/posts/${postId}/like`,
  });
}
