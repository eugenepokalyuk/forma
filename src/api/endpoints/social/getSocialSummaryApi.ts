import { apiRequest } from '@/api/request/apiRequest';
import type { SocialSummary } from '@/api/models';

export function getSocialSummaryApi() {
  return apiRequest<SocialSummary>({
    method: 'get',
    url: '/social/summary',
  });
}
