import * as React from 'react';

import type { Exercise } from '@/modules/programs';
import {
  stepAfterRest,
  stepToExercise,
  useSessionStore,
  type WorkoutStep,
} from '@/modules/workout';

import { useRestEndSound } from './useRestEndSound';

export type SessionPhase = 'exercise' | 'rest' | 'summary';

// Фаза экрана тренировки и переходы между упражнениями. Состояние берём из
// стора, а не из рендера: переходы зовутся сразу после записи в стор.
export function useSessionSteps(totalSetsOf: (ex: Exercise) => number) {
  const playRestEndSound = useRestEndSound();
  // После перезапуска приложения посреди отдыха возвращаемся в отдых —
  // истёкший таймер сразу завершит его и переведёт дальше (см. finishRest).
  const [phase, setPhase] = React.useState<SessionPhase>(() =>
    useSessionStore.getState().active?.restEndsAt ? 'rest' : 'exercise',
  );

  // Применяет шаг: перейти к упражнению или открыть итог.
  const goTo = (step: WorkoutStep) => {
    if (step.kind === 'summary') {
      setPhase('summary');
      return;
    }
    useSessionStore.getState().goToExercise(step.index);
    setPhase('exercise');
  };

  // Тап по полосе упражнений — прямо к выбранному, даже выполненному или
  // пропущенному: к сделанному возвращаются, чтобы добавить подход.
  const navigate = (index: number) => {
    if (index < 0) return;
    goTo({ kind: 'exercise', index });
  };

  // Переход по ходу тренировки (после пропуска) — к следующему незаконченному,
  // законченные проходим насквозь.
  const jump = (delta: number) => {
    const current = useSessionStore.getState().active;
    if (!current) return;
    goTo(
      stepToExercise(
        current.workout.exercises,
        current.logs,
        current.currentExerciseIndex + delta,
        totalSetsOf,
      ),
    );
  };

  // Отдых — самостоятельный полноэкранный шаг. Когда он заканчивается (сам
  // или по «Пропустить»), решаем по текущему состоянию: все подходы этого
  // упражнения сделаны — идём дальше, иначе возвращаемся к нему же на
  // следующий подход.
  const finishRest = (options?: { sound?: boolean }) => {
    if (options?.sound) playRestEndSound();
    useSessionStore.getState().clearRest();
    const current = useSessionStore.getState().active;
    if (!current) return;

    goTo(
      stepAfterRest(
        current.workout.exercises,
        current.logs,
        current.currentExerciseIndex,
        totalSetsOf,
      ),
    );
  };

  return { phase, setPhase, navigate, jump, finishRest };
}
