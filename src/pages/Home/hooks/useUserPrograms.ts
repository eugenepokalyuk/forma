import * as ReactQuery from '@tanstack/react-query';

import { getUserProgramsApi } from '@/api';

// Программы пользователя, активные — первыми.
export function useUserPrograms() {
  const query = ReactQuery.useQuery({
    queryKey: ['userPrograms'],
    queryFn: getUserProgramsApi,
  });

  const programs = [...(query.data ?? [])].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );

  return {
    ...query,
    programs,
    activeProgram: programs.find((up) => up.isActive),
  };
}
