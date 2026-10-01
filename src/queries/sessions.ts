import * as ReactQuery from '@tanstack/react-query';

import { getSessionsApi } from '@/api';
import { queryKeys } from '@/queries/keys';

export function useSessions() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.sessions,
    queryFn: getSessionsApi,
  });
}
