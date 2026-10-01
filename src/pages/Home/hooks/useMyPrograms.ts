import { useUserPrograms } from '@/modules/programs';

// Программы пользователя, активные — первыми.
export function useMyPrograms() {
  const query = useUserPrograms();

  const programs = [...(query.data ?? [])].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );

  return {
    ...query,
    programs,
    activeProgram: programs.find((up) => up.isActive),
  };
}
