import { apiRequest } from '@/shared/api/apiRequest';
import type { UserProgram } from '../models/program';

export function addUserProgramApi(programId: string) {
  return apiRequest<UserProgram>({
    method: 'post',
    url: '/user-programs',
    data: { programId },
  });
}
