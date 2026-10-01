import { apiRequest } from '@/shared/api/apiRequest';

export function deleteAccountApi() {
  return apiRequest({ method: 'delete', url: '/auth/account' });
}
