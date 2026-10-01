import { apiRequest } from '@/shared/api/apiRequest';
import type { Post } from '../models/social';

export function likePostApi(postId: string) {
  return apiRequest<Post>({
    method: 'post',
    url: `/social/posts/${postId}/like`,
  });
}
