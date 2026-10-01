import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import { getSessionsApi } from '@/api';

// Даты завершённых тренировок — для полосы недели и цели недели.
export function useTrainedDates() {
  const { data: sessions } = ReactQuery.useQuery({
    queryKey: ['sessions'],
    queryFn: getSessionsApi,
  });

  return React.useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status === 'completed' && s.completedAt)
        .map((s) => new Date(s.completedAt as string)),
    [sessions],
  );
}
