import { apiRequest } from '@/api/request/apiRequest';
import type { UserProgram } from '@/api/models';

export function getUserProgramsApi() {
  return apiRequest<UserProgram[]>({
    method: 'get',
    url: '/user-programs',
  });
}
