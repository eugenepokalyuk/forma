import * as React from 'react';

// Заметка к подходу — черновик живёт, пока не переключились на другое
// упражнение (и переживает отдых и возврат из итога).
export function useNoteDraft(exerciseId: string | undefined) {
  const [draft, setDraft] = React.useState('');
  const [forExercise, setForExercise] = React.useState(exerciseId);
  if (forExercise !== exerciseId) {
    setForExercise(exerciseId);
    setDraft('');
  }

  return [draft, setDraft] as const;
}
