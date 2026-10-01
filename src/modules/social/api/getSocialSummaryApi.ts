import { apiRequest } from '@/shared/api/apiRequest';
import type { SocialSummary } from '../models/social';

export function getSocialSummaryApi() {
  return apiRequest<SocialSummary>({
    method: 'get',
    url: '/social/summary',
  });
}
