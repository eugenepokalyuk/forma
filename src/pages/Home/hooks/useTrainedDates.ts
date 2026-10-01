import * as React from 'react';

import { useSessions } from '@/queries/sessions';

// Даты завершённых тренировок — для полосы недели и цели недели.
export function useTrainedDates() {
  const { data: sessions } = useSessions();

  return React.useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.status === 'completed' && s.completedAt)
        .map((s) => new Date(s.completedAt as string)),
    [sessions],
  );
}
