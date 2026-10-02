import * as Haptics from 'expo-haptics';
import * as React from 'react';

import type { ReactionValue } from '@/modules/programs';
import { completeWorkout, type WorkoutFinish } from '@/modules/workout';

import { SessionSummary } from '@/pages/Session/components/SessionSummary';
import { WorkoutFeedback } from '@/pages/Session/components/WorkoutFeedback';
import { WorkoutShare } from '@/pages/Session/components/WorkoutShare';

type Step = 'summary' | 'feedback' | 'share';

interface FinishFlowProps {
  elapsed: number;
  /** Вернуться из итога к тренировке. */
  onBack: () => void;
}

// Завершение тренировки, как на сайте: итог → оценка → пост в ленту.
// Ответы копятся здесь и уходят одним completeWorkout в конце — до этого
// тренировка остаётся активной, и «назад» на любом шаге ничего не теряет.
export function FinishFlow({ elapsed, onBack }: FinishFlowProps) {
  const [step, setStep] = React.useState<Step>('summary');
  const [notes, setNotes] = React.useState('');
  const [reaction, setReaction] = React.useState<ReactionValue | null>(null);

  const finish = (post: WorkoutFinish['post'] = null) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeWorkout({ notes, reaction, post });
  };

  if (step === 'feedback') {
    return (
      <WorkoutFeedback
        value={reaction}
        onChange={setReaction}
        onSubmit={() => setStep('share')}
        onSkip={() => {
          setReaction(null);
          setStep('share');
        }}
        onBack={() => setStep('summary')}
      />
    );
  }

  if (step === 'share') {
    return (
      <WorkoutShare
        onPublish={finish}
        onSkip={() => finish()}
        onBack={() => setStep('feedback')}
      />
    );
  }

  return (
    <SessionSummary
      elapsed={elapsed}
      notes={notes}
      onNotesChange={setNotes}
      onBack={onBack}
      onDone={() => setStep('feedback')}
    />
  );
}
