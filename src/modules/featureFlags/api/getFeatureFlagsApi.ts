import { apiRequest } from '@/shared/api/apiRequest';
import type { FeatureFlag } from '../models/featureFlag';

export function getFeatureFlagsApi() {
  return apiRequest<FeatureFlag[]>({
    method: 'get',
    url: '/feature-flags',
  });
}
