import { router } from 'expo-router';
import * as React from 'react';

import type { UserProgram } from '@/modules/programs';
import { useProgram } from '@/modules/programs';
import {
  getNextWorkout,
  useSessions,
  useSessionStore,
  useStartWorkout,
} from '@/modules/workout';
import { ROUTES } from '@/shared/constants/routes';
import { sessionVolumeKg, type BroTodayContext } from '@/modules/bro';
import { isSameDay } from '@/shared/lib/date/calendar';

// Контекст «сегодня» для карточек Бро: следующая по плану тренировка
// активной программы, её статус и действия начать/продолжить.
export function useTodayWorkout(
  activeProgram: UserProgram | undefined,
): BroTodayContext {
  const activeSession = useSessionStore((s) => s.active);
  const startWorkout = useStartWorkout();

  const { data: sessions } = useSessions();

  // Полная активная программа (уже в кэше — см. usePrefetchActivePrograms) —
  // нужна, чтобы посчитать следующую по плану тренировку.
  const { data: activeProgramDetails } = useProgram(activeProgram?.programId);

  const todayWorkout = React.useMemo(() => {
    if (!activeProgram) return null;
    const workouts = activeProgramDetails
      ? [...activeProgramDetails.workouts].sort(
          (a, b) => a.dayNumber - b.dayNumber,
        )
      : [];
    return getNextWorkout(workouts, sessions ?? [], activeProgram.programId);
  }, [activeProgram, activeProgramDetails, sessions]);

  const todayCompletedSession = React.useMemo(() => {
    if (!activeProgram) return null;
    const now = new Date();
    return (
      (sessions ?? []).find(
        (s) =>
          s.programId === activeProgram.programId &&
          s.status === 'completed' &&
          isSameDay(new Date(s.startedAt), now),
      ) ?? null
    );
  }, [sessions, activeProgram]);

  const isTodayInProgress =
    !!activeSession && activeSession.programId === activeProgram?.programId;

  const beginTodayWorkout = React.useCallback(() => {
    if (!activeProgram || !todayWorkout) return;
    startWorkout({ programId: activeProgram.programId, workout: todayWorkout });
  }, [activeProgram, todayWorkout, startWorkout]);

  return React.useMemo(
    () => ({
      isToday: true,
      hasWorkout: !!todayWorkout,
      workoutName: todayWorkout?.name ?? null,
      isCompleted: !!todayCompletedSession,
      isInProgress: isTodayInProgress,
      onStart: beginTodayWorkout,
      onContinue: () => router.replace(ROUTES.sessionActive),
      completedVolumeKg: todayCompletedSession
        ? sessionVolumeKg(todayCompletedSession)
        : null,
    }),
    [todayWorkout, todayCompletedSession, isTodayInProgress, beginTodayWorkout],
  );
}
