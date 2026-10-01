import { apiRequest } from '@/shared/api/apiRequest';
import type { PublicUser } from '../models/social';

export function getOutgoingRequestsApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/requests/outgoing',
  });
}
