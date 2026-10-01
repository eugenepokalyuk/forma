import { apiRequest } from '@/api/request/apiRequest';
import type { Program } from '@/api/models';

export function getCatalogApi() {
  return apiRequest<Program[]>({
    method: 'get',
    url: '/programs',
  });
}
