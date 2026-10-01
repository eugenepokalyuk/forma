import { apiRequest } from '@/api/request/apiRequest';
import type { Post } from '@/api/models';

// Соответствует forma-next/src/services/Api/social/social.api.ts —
// та же лента, тот же Django-бэкенд, поля уже camelCase.
export function getFeedApi(before?: string) {
  return apiRequest<Post[]>({
    method: 'get',
    url: '/social/feed',
    params: before ? { before } : undefined,
  });
}
