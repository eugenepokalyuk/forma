import { apiRequest } from '@/shared/api/apiRequest';
import type { Comment } from '../models/social';

export function addCommentApi(postId: string, text: string) {
  return apiRequest<Comment>({
    method: 'post',
    url: `/social/posts/${postId}/comments`,
    data: { text },
  });
}
