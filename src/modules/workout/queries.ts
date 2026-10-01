import * as ReactQuery from '@tanstack/react-query';

import { getSessionsApi } from './api/getSessionsApi';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const workoutKeys = {
  sessions: ['sessions'] as const,
};

export function useSessions() {
  return ReactQuery.useQuery({
    queryKey: workoutKeys.sessions,
    queryFn: getSessionsApi,
  });
}
