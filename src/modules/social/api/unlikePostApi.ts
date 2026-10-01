import { apiRequest } from '@/shared/api/apiRequest';
import type { Post } from '../models/social';

export function unlikePostApi(postId: string) {
  return apiRequest<Post>({
    method: 'delete',
    url: `/social/posts/${postId}/like`,
  });
}
