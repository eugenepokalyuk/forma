import * as ReactQuery from '@tanstack/react-query';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getProgramApi, getSessionsApi, getUserProgramsApi } from '@/api';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { FadeInItem } from '@/components/FadeInItem';
import { ProgramCard } from '@/components/ProgramCard';
import { ScreenContainer, Section, Typography } from '@/components/ui';
import { useTabBarClearance } from '@/components/TabBar';
import { TipsCarousel } from '@/pages/Home/components/TipsCarousel';
import { WeekStrip } from '@/pages/Home/components/WeekStrip';
import { COLORS, motion, radius, spacing } from '@/theme';
import {
  formatMonthLabel,
  getCurrentWeek,
  isSameDay,
} from '@/utils/helpers/date/calendar';
import { ROUTES } from '@/utils/constants/routes';
import {
  getNextWorkout,
  getWeeklyGoal,
  sessionVolumeKg,
  type BroTodayContext,
} from '@/utils/helpers/bro/broMessages';
import { useAuthStore } from '@/store/auth';
import { useOutboxStore } from '@/store/outbox';
import { useSessionStore } from '@/store/session';

// TODO: компонент тяжело читается, разнести логику на тонкие контейнеры в разные файлы компонентов (тонкие компоненты)
export default function HomeScreen() {
  const queryClient = ReactQuery.useQueryClient();
  const pending = useOutboxStore((s) => s.ops.length);
  const tabBarClearance = useTabBarClearance();
  const user = useAuthStore((s) => s.user);
  const activeSession = useSessionStore((s) => s.active);
  const startSession = useSessionStore((s) => s.start);

  const {
    data,
    isLoading,
    refetch: refetchPrograms,
  } = ReactQuery.useQuery({
    queryKey: ['userPrograms'],
    queryFn: getUserProgramsApi,
  });

  const { data: sessions, refetch: refetchSessions } = ReactQuery.useQuery({
    queryKey: ['sessions'],
    queryFn: getSessionsApi,
  });

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPrograms(), refetchSessions()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchPrograms, refetchSessions]);

  // Предзагружаем программу целиком для каждой активной — она будет в
  // кэше до прихода в зал.
  React.useEffect(() => {
    data
      ?.filter((up) => up.isActive)
      .forEach((up) => {
        void queryClient.prefetchQuery({
          queryKey: ['program', up.programId],
          queryFn: () => getProgramApi(up.programId),
        });
      });
  }, [data, queryClient]);

  const trainedDates = (sessions ?? [])
    .filter((s) => s.status === 'completed' && s.completedAt)
    .map((s) => new Date(s.completedAt as string));

  const sorted = [...(data ?? [])].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );
  const activeProgram = sorted.find((up) => up.isActive);
  const hasPrograms = !isLoading && sorted.length > 0;

  const week = getCurrentWeek();
  const daysTrainedThisWeek = week.filter((d) =>
    trainedDates.some((t) => isSameDay(t, d.date)),
  ).length;

  // Полная активная программа (уже в кэше — см. префетч выше) — нужна,
  // чтобы посчитать следующую по плану тренировку для карточки Бро.
  const { data: activeProgramDetails } = ReactQuery.useQuery({
    queryKey: ['program', activeProgram?.programId],
    queryFn: () => getProgramApi(activeProgram!.programId),
    enabled: !!activeProgram,
  });

  const programWorkouts = React.useMemo(
    () =>
      activeProgramDetails
        ? [...activeProgramDetails.workouts].sort(
            (a, b) => a.dayNumber - b.dayNumber,
          )
        : [],
    [activeProgramDetails],
  );

  const todayWorkout = React.useMemo(
    () =>
      activeProgram
        ? getNextWorkout(
            programWorkouts,
            sessions ?? [],
            activeProgram.programId,
          )
        : null,
    [activeProgram, programWorkouts, sessions],
  );

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
    const begin = () => {
      startSession({
        programId: activeProgram.programId,
        workoutId: todayWorkout.id,
        workout: todayWorkout,
      });
      router.replace(ROUTES.sessionActive);
    };
    if (activeSession && activeSession.programId !== activeProgram.programId) {
      Alert.alert('Завершить текущую и начать новую?', undefined, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить и начать',
          style: 'destructive',
          onPress: () => {
            useSessionStore.getState().completeSession();
            begin();
          },
        },
      ]);
      return;
    }
    begin();
  }, [activeProgram, todayWorkout, activeSession, startSession]);

  const today: BroTodayContext = React.useMemo(
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

  const weeklyGoal = React.useMemo(
    () => getWeeklyGoal(user?.workoutFrequency, daysTrainedThisWeek),
    [user?.workoutFrequency, daysTrainedThisWeek],
  );

  return (
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <AppHeader />

      {/* TODO: 002, комментарии в файле компонента */}
      {/* Состояния вынести в отдельные компоненты, на каждое состояние должна быть своя вьюха (view) */}
      <React.Fragment>
        {pending > 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={motion.springSoft}
            style={styles.syncBanner}
          >
            <View style={styles.syncDot} />

            <Typography variant="caption" color={COLORS.Text.accent}>
              Не синхронизировано: {pending}
            </Typography>
          </MotiView>
        ) : null}

        <Section>
          <Typography
            variant="label"
            color={COLORS.Text.tertiary}
            style={{ marginBottom: spacing.sm }}
          >
            {formatMonthLabel()}
          </Typography>

          <WeekStrip trainedDates={trainedDates} />
        </Section>

        <Section>
          <TipsCarousel today={today} weeklyGoal={weeklyGoal} />
        </Section>

        {/* Вынеси в отдельную вьюху */}
        {!hasPrograms ? (
          <Section>
            <View style={styles.ctaCard}>
              <Typography variant="title">
                {'Выберите программу для тренировки'}
              </Typography>

              <Typography
                variant="body"
                color={COLORS.Text.secondary}
                style={{ marginBottom: spacing.sm }}
              >
                {
                  'или создайте свою программу используя упражнения из нашего каталога'
                }
              </Typography>

              <Button
                title="К готовым программам"
                onPress={() => router.push(ROUTES.catalog)}
              />

              <Button
                title="Своя программа"
                variant="secondary"
                onPress={() =>
                  Alert.alert(
                    'Скоро',
                    'Сборка своей тренировки появится в одном из следующих обновлений',
                  )
                }
              />
            </View>
          </Section>
        ) : (
          <Section
            title="Мои программы"
            action={{
              label: 'Каталог',
              onPress: () => router.push(ROUTES.catalog),
            }}
          >
            <View style={{ gap: spacing.sm }}>
              {sorted.map((item, index) => (
                <FadeInItem key={item.id} index={index}>
                  <ProgramCard program={item.program} active={item.isActive} />
                </FadeInItem>
              ))}
            </View>
          </Section>
        )}
      </React.Fragment>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: COLORS.Surface.accentSubdued,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.Surface.accent,
  },
  ctaCard: {
    gap: 8,
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    padding: spacing.md,
  },
});
