import { apiRequest } from '@/shared/api/apiRequest';

// Удалить можно только свой пост — чужой бэк не найдёт (404).
export function deletePostApi(postId: string) {
  return apiRequest<void>({
    method: 'delete',
    url: `/social/posts/${postId}`,
  });
}
