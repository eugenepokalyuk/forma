import { apiRequest } from '@/shared/api/apiRequest';
import type { Program } from '../models/program';

export function getCatalogApi() {
  return apiRequest<Program[]>({
    method: 'get',
    url: '/programs',
  });
}
