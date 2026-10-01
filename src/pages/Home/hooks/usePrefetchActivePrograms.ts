import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import { getProgramApi, type UserProgram } from '@/api';

// Предзагружаем программу целиком для каждой активной — она будет в
// кэше до прихода в зал.
export function usePrefetchActivePrograms(programs: UserProgram[] | undefined) {
  const queryClient = ReactQuery.useQueryClient();

  React.useEffect(() => {
    programs
      ?.filter((up) => up.isActive)
      .forEach((up) => {
        void queryClient.prefetchQuery({
          queryKey: ['program', up.programId],
          queryFn: () => getProgramApi(up.programId),
        });
      });
  }, [programs, queryClient]);
}
