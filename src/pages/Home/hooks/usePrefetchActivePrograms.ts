import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import type { UserProgram } from '@/modules/programs';
import { programQueryOptions } from '@/modules/programs';

// Предзагружаем программу целиком для каждой активной — она будет в
// кэше до прихода в зал.
export function usePrefetchActivePrograms(programs: UserProgram[] | undefined) {
  const queryClient = ReactQuery.useQueryClient();

  React.useEffect(() => {
    programs
      ?.filter((up) => up.isActive)
      .forEach((up) => {
        void queryClient.prefetchQuery(programQueryOptions(up.programId));
      });
  }, [programs, queryClient]);
}
