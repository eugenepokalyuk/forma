import * as React from 'react';

import type { Exercise } from '@/modules/programs';

// Подходы, добавленные вручную сверх плана, — по упражнению. Живут в
// пределах экрана тренировки и не персистятся, как и exercise.sets.
export function useExtraSets() {
  const [extra, setExtra] = React.useState<Record<string, number>>({});

  const change = (exerciseId: string, delta: number) =>
    setExtra((prev) => ({
      ...prev,
      [exerciseId]: Math.max(0, (prev[exerciseId] ?? 0) + delta),
    }));

  return {
    totalSetsOf: (ex: Exercise) => ex.sets + (extra[ex.id] ?? 0),
    addSet: (exerciseId: string) => change(exerciseId, 1),
    removeExtraSet: (exerciseId: string) => change(exerciseId, -1),
  };
}
