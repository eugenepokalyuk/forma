import * as ReactQuery from '@tanstack/react-query';
import axios from 'axios';
import { router, Stack } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import * as React from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import {
  addUserProgramApi,
  getLastLogApi,
  getProgramApi,
  getUserProgramsApi,
} from '@/api';
import type { LastLog, WorkoutWithExercises } from '@/api';
import { WeekPill } from '@/components/WeekPill';
import { WorkoutListItem } from '@/components/WorkoutListItem';
import { ScreenContainer, Typography } from '@/components/ui';
import { COLORS, spacing } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useSessionStore } from '@/store/session';
import { ROUTES } from '@/utils/constants/routes';

export default function ProgramScreen() {
  const { id } = ExpoRouter.useLocalSearchParams<{ id: string }>();
  const queryClient = ReactQuery.useQueryClient();
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);
  const { data, isLoading } = ReactQuery.useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgramApi(id),
  });
  const { data: userPrograms } = ReactQuery.useQuery({
    queryKey: ['userPrograms'],
    queryFn: getUserProgramsApi,
  });
  const [week, setWeek] = React.useState(1);
  const [expandedWorkoutId, setExpandedWorkoutId] = React.useState<
    string | null
  >(null);

  const activeSession = useSessionStore((s) => s.active);
  const startSession = useSessionStore((s) => s.start);
  const completeSession = useSessionStore((s) => s.completeSession);

  const addMutation = ReactQuery.useMutation({
    mutationFn: () => addUserProgramApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['userPrograms'] });
    },
    onError: (e) => {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ['userPrograms'] });
        return;
      }
      Alert.alert('Не получилось добавить программу');
    },
  });

  // Спиннер только при пустом кэше — данные из кэша показываются мгновенно,
  // обновление идёт в фоне.
  if (isLoading && !data) {
    return <ScreenContainer edges={[]} loading />;
  }

  if (!data) return null;

  const isInLibrary = (userPrograms ?? []).some(
    (up) => up.programId === data.id,
  );
  const isProLocked = data.tier === 'pro' && !hasProAccess;

  const workoutsOfWeek = data.workouts.filter((w) => w.weekNumber === week);

  const beginWorkout = (workout: WorkoutWithExercises) => {
    startSession({ programId: data.id, workoutId: workout.id, workout });
    router.replace(ROUTES.sessionActive);

    // Подсказка «прошлый раз» — необязательна, начинаем без неё, если сети
    // нет; подтягиваем в фоне и докладываем в стор, когда придёт.
    const catalogIds = [
      ...new Set(
        workout.exercises
          .map((e) => e.catalogExerciseId)
          .filter((v): v is string => !!v),
      ),
    ];
    void Promise.all(
      catalogIds.map((catalogId) =>
        getLastLogApi(catalogId)
          .then((logs) => [catalogId, logs] as const)
          .catch(() => null),
      ),
    ).then((results) => {
      const merged: Record<string, LastLog[]> = {};
      for (const r of results) {
        if (r) merged[r[0]] = r[1];
      }
      if (Object.keys(merged).length > 0)
        useSessionStore.getState().mergeLastLogs(merged);
    });
  };

  const onStartWorkout = (workout: WorkoutWithExercises) => {
    if (activeSession) {
      Alert.alert('Завершить текущую и начать новую?', undefined, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить и начать',
          style: 'destructive',
          onPress: () => {
            completeSession();
            beginWorkout(workout);
          },
        },
      ]);
      return;
    }
    beginWorkout(workout);
  };

  return (
    <ScreenContainer edges={[]}>
      <Stack.Screen options={{ title: '' }} />

      <View>
        <Typography
          variant="display"
          color={COLORS.Text.primary}
          style={styles.titleLine}
        >
          {data.title}
        </Typography>

        <Typography
          variant="display"
          color={COLORS.Text.tertiary}
          style={styles.titleLine}
        >
          {'Выберите день'}
        </Typography>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
        contentContainerStyle={styles.weekRow}
      >
        {data.weeks.map((w) => (
          <WeekPill
            key={w.weekNumber}
            week={w}
            active={week === w.weekNumber}
            onPress={() => setWeek(w.weekNumber)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={workoutsOfWeek}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          !isInLibrary && { paddingBottom: 110 },
        ]}
        renderItem={({ item, index }) => (
          <WorkoutListItem
            workout={item}
            index={index}
            expanded={expandedWorkoutId === item.id}
            onToggle={() =>
              setExpandedWorkoutId(
                expandedWorkoutId === item.id ? null : item.id,
              )
            }
            onStartWorkout={onStartWorkout}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleLine: {
    lineHeight: 32,
  },
  weekScroll: {
    flexGrow: 0,
  },
  weekRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 84,
    height: 40,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: COLORS.Background.primary,
  },
});
