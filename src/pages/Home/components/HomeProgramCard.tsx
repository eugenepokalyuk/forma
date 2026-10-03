import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useProgram, type UserProgram } from '@/modules/programs';
import {
  getNextWorkout,
  useSessions,
  useSessionStore,
  useStartWorkout,
} from '@/modules/workout';
import { WorkoutExercises } from '@/modules/workout/ui';
import {
  Button,
  Divider,
  GlassCard,
  GlassIconButton,
  Typography,
} from '@/shared/ui';
import { COLORS, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

interface HomeProgramCardProps {
  userProgram: UserProgram;
}

// Программа на главной: название, старт следующей по плану тренировки и её
// упражнения. Карандаш — на страницу программы, где можно выбрать другой день.
export function HomeProgramCard({ userProgram }: HomeProgramCardProps) {
  const { programId, program } = userProgram;
  const { data: details } = useProgram(programId);
  const { data: sessions } = useSessions();
  const activeSession = useSessionStore((s) => s.active);
  const startWorkout = useStartWorkout();

  const nextWorkout = React.useMemo(() => {
    if (!details) return null;
    const ordered = [...details.workouts].sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );
    return getNextWorkout(ordered, sessions ?? [], programId);
  }, [details, sessions, programId]);

  const inProgress = activeSession?.programId === programId;

  const onStart = () => {
    if (inProgress) {
      router.replace(ROUTES.sessionActive);
      return;
    }
    if (nextWorkout) startWorkout({ programId, workout: nextWorkout });
  };

  return (
    <GlassCard>
      <Typography variant="body" color={COLORS.Text.secondary}>
        {'Готовая программа'}
      </Typography>

      <Typography variant="display" numberOfLines={2}>
        {program.title}
      </Typography>

      <View style={styles.actions}>
        <Button
          title={inProgress ? 'Продолжить тренировку' : 'Начать тренировку'}
          onPress={onStart}
          disabled={!inProgress && !nextWorkout}
          style={styles.start}
        />

        <GlassIconButton
          icon="pencil"
          variant="accent"
          accessibilityLabel="Открыть программу и выбрать день"
          onPress={() => router.push(ROUTES.program(programId))}
        />
      </View>

      {/* Разделитель во всю ширину карточки — поверх её отступов. */}
      <Divider style={styles.divider} />

      {nextWorkout ? (
        <View style={styles.day}>
          <Typography variant="subtitle">
            {`День ${nextWorkout.dayNumber}`}
          </Typography>

          <WorkoutExercises exercises={nextWorkout.exercises} />
        </View>
      ) : !details ? (
        <ActivityIndicator color={COLORS.Icon.accent} style={styles.day} />
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  start: { flex: 1 },
  divider: {
    width: 'auto',
    marginHorizontal: -spacing.md,
    marginTop: spacing.md,
    backgroundColor: COLORS.Stroke.primary,
  },
  day: { gap: spacing.sm, marginTop: spacing.sm },
});
