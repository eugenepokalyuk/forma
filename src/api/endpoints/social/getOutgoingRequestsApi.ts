import { apiRequest } from '@/api/request/apiRequest';
import type { PublicUser } from '@/api/models';

export function getOutgoingRequestsApi() {
  return apiRequest<PublicUser[]>({
    method: 'get',
    url: '/social/requests/outgoing',
  });
}
