import { apiRequest } from '@/api/request/apiRequest';
import type { UserProgram } from '@/api/models';

export function addUserProgramApi(programId: string) {
  return apiRequest<UserProgram>({
    method: 'post',
    url: '/user-programs',
    data: { programId },
  });
}
