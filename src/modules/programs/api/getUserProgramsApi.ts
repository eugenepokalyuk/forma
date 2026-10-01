import { apiRequest } from '@/shared/api/apiRequest';
import type { UserProgram } from '../models/program';

export function getUserProgramsApi() {
  return apiRequest<UserProgram[]>({
    method: 'get',
    url: '/user-programs',
  });
}
