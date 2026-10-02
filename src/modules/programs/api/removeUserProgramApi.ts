import { apiRequest } from '@/shared/api/apiRequest';

// userProgramId — id записи в «Моих программах» (UserProgram.id), не программы.
export function removeUserProgramApi(userProgramId: string) {
  return apiRequest({
    method: 'delete',
    url: `/user-programs/${userProgramId}`,
  });
}
