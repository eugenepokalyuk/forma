import * as ExpoKeepAwake from 'expo-keep-awake';

import { useSessionStore } from '@/modules/workout';
import { FinishFlow } from '@/pages/Session/components/FinishFlow';
import { ExerciseView } from '@/pages/Session/components/views/ExerciseView';
import { RestView } from '@/pages/Session/components/views/RestView';
import { useElapsedSeconds } from '@/pages/Session/hooks/useElapsedSeconds';
import { useExtraSets } from '@/pages/Session/hooks/useExtraSets';
import { useNoteDraft } from '@/pages/Session/hooks/useNoteDraft';
import { useSessionSteps } from '@/pages/Session/hooks/useSessionSteps';

// Режим выполнения: фаза (упражнение / отдых / итог) и переходы между
// ними; всё, что внутри фазы, — в её view.
export default function ActiveSessionScreen() {
  ExpoKeepAwake.useKeepAwake();
  const active = useSessionStore((s) => s.active);
  const elapsed = useElapsedSeconds(active?.startedAt);
  const { totalSetsOf, addSet, removeExtraSet } = useExtraSets();
  const { phase, setPhase, navigate, jump, finishRest } =
    useSessionSteps(totalSetsOf);
  const exercise = active?.workout.exercises[active.currentExerciseIndex];
  const [noteDraft, setNoteDraft] = useNoteDraft(exercise?.id);

  if (!active || !exercise) return null;

  if (phase === 'summary') {
    return <FinishFlow elapsed={elapsed} onBack={() => setPhase('exercise')} />;
  }

  if (phase === 'rest') {
    return (
      <RestView active={active} totalSetsOf={totalSetsOf} onDone={finishRest} />
    );
  }

  return (
    <ExerciseView
      active={active}
      totalSetsOf={totalSetsOf}
      onAddSet={addSet}
      onRemoveExtraSet={removeExtraSet}
      noteDraft={noteDraft}
      onNoteChange={setNoteDraft}
      onNavigate={navigate}
      onJump={jump}
      onLogged={() => setPhase('rest')}
      onFinish={() => setPhase('summary')}
    />
  );
}
