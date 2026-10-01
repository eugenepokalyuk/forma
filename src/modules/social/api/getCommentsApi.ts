import { apiRequest } from '@/shared/api/apiRequest';
import type { Comment } from '../models/social';

export function getCommentsApi(postId: string) {
  return apiRequest<Comment[]>({
    method: 'get',
    url: `/social/posts/${postId}/comments`,
  });
}
