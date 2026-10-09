import * as React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useProgram } from '@/modules/programs';
import { getNextWorkout, useSessions } from '@/modules/workout';
import { WorkoutExercises } from '@/modules/workout/ui';
import { Divider, GlassCard, Section, Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';
import { DayNoteCard } from '@/pages/Home/components/DayNoteCard';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';

// Будущий день: тренировки привязаны не к датам, а к очереди программы —
// показываем следующую по плану, без старта: начать можно только сегодня.
export function FutureDayView() {
  const { activeProgram, isLoading } = useMyPrograms();
  const { data: details } = useProgram(activeProgram?.programId);
  const { data: sessions } = useSessions();

  const nextWorkout = React.useMemo(() => {
    if (!activeProgram || !details) return null;
    const ordered = [...details.workouts].sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );
    return getNextWorkout(ordered, sessions ?? [], activeProgram.programId);
  }, [activeProgram, details, sessions]);

  if (isLoading) return null;

  if (!activeProgram) {
    return (
      <DayNoteCard
        title="Этот день впереди"
        message="Выберите программу — и здесь появится следующая тренировка по плану"
      />
    );
  }

  return (
    <Section padding>
      <GlassCard>
        <Typography variant="body" color={COLORS.Text.secondary}>
          {'Следующая по плану'}
        </Typography>

        <Typography variant="display" numberOfLines={2}>
          {activeProgram.program.title}
        </Typography>

        <Typography variant="body" color={COLORS.Text.tertiary}>
          {'Начать тренировку можно будет в этот день'}
        </Typography>

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
    </Section>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: 'auto',
    marginHorizontal: -spacing.md,
    marginTop: spacing.sm,
    backgroundColor: COLORS.Stroke.primary,
  },
  day: { gap: spacing.sm, marginTop: spacing.sm },
});
