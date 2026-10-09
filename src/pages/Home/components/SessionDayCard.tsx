import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  sessionExerciseResults,
  type ExerciseResult,
  type SessionWithWorkout,
} from '@/modules/workout';
import { sessionVolumeKg } from '@/modules/bro';
import { Divider, GlassCard, Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';
import { formatTonnage } from '@/shared/lib/string/number';

interface SessionDayCardProps {
  session: SessionWithWorkout;
  programTitle: string | null;
}

// Тренировка прошедшего дня — только посмотреть: выполнена она или нет,
// итог и что сделано по каждому упражнению.
export function SessionDayCard({ session, programTitle }: SessionDayCardProps) {
  const completed = session.status === 'completed';
  const results = React.useMemo(
    () => sessionExerciseResults(session),
    [session],
  );

  const sets = session.exerciseLogs.filter((l) => !l.skipped).length;
  const volume = sessionVolumeKg(session);
  const minutes = session.completedAt
    ? Math.round(
        (new Date(session.completedAt).getTime() -
          new Date(session.startedAt).getTime()) /
          60_000,
      )
    : null;

  return (
    <GlassCard>
      <Typography
        variant="body"
        color={completed ? COLORS.Text.positive : COLORS.Text.secondary}
      >
        {completed ? 'Тренировка выполнена' : 'Тренировка не завершена'}
      </Typography>

      <Typography variant="display" numberOfLines={2}>
        {programTitle ?? session.workout.name}
      </Typography>

      <View style={styles.stats}>
        <Stat value={String(sets)} label="Подходов" />
        <Stat value={formatTonnage(volume)} label="Тоннаж" />
        {minutes != null ? (
          <Stat value={`${minutes} мин`} label="Время" />
        ) : null}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.day}>
        <Typography variant="subtitle">
          {`День ${session.workout.dayNumber}`}
        </Typography>

        {results.map((result) => (
          <ExerciseResultRow key={result.exercise.id} result={result} />
        ))}
      </View>
    </GlassCard>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Typography variant="title">{value}</Typography>
      <Typography variant="body" color={COLORS.Text.secondary}>
        {label}
      </Typography>
    </View>
  );
}

function ExerciseResultRow({ result }: { result: ExerciseResult }) {
  const { exercise, setsDone, skipped } = result;
  const done = setsDone >= exercise.sets;

  return (
    <View style={styles.row}>
      <Typography variant="body" style={styles.name} numberOfLines={2}>
        {exercise.name}
      </Typography>

      <Typography
        variant="body"
        color={
          skipped
            ? COLORS.Text.negative
            : done
              ? COLORS.Text.positive
              : COLORS.Text.secondary
        }
      >
        {skipped && setsDone === 0
          ? 'Пропущено'
          : `${setsDone} из ${exercise.sets}`}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  stat: { flex: 1, gap: 2 },
  divider: {
    width: 'auto',
    marginHorizontal: -spacing.md,
    marginTop: spacing.sm,
    backgroundColor: COLORS.Stroke.primary,
  },
  day: { gap: spacing.sm, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: { flex: 1 },
});
