import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import type { UserProgram } from '@/modules/programs';
import {
  exerciseCatalogQueryOptions,
  programQueryOptions,
} from '@/modules/programs';

// Предзагружаем программу целиком для каждой активной и каталог упражнений
// (замена и добавление во время тренировки) — всё будет в кэше до прихода
// в зал.
export function usePrefetchActivePrograms(programs: UserProgram[] | undefined) {
  const queryClient = ReactQuery.useQueryClient();

  React.useEffect(() => {
    if (programs?.some((up) => up.isActive)) {
      void queryClient.prefetchQuery(exerciseCatalogQueryOptions);
    }
    programs
      ?.filter((up) => up.isActive)
      .forEach((up) => {
        void queryClient.prefetchQuery(programQueryOptions(up.programId));
      });
  }, [programs, queryClient]);
}
