import * as React from 'react';

import { useUserPrograms, type ProgramWithWorkouts } from '@/modules/programs';
import { getProgramProgress, useSessions } from '@/modules/workout';

// Текущий и пройденные дни — та же логика, что «Сегодня» на главной.
// У программы, которую не добавляли и не проходили, ничего не выделяем.
export function useProgramProgress(program: ProgramWithWorkouts | undefined) {
  const { data: userPrograms } = useUserPrograms();
  const { data: sessions } = useSessions();
  const isAdded = (userPrograms ?? []).some(
    (up) => up.programId === program?.id,
  );

  return React.useMemo(() => {
    if (!program) return null;
    const history = sessions ?? [];
    const touched = isAdded || history.some((s) => s.programId === program.id);
    if (!touched) return null;
    const ordered = [...program.workouts].sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );
    return getProgramProgress(ordered, history, program.id);
  }, [program, sessions, isAdded]);
}
