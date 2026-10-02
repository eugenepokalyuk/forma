import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import type { WorkoutWithExercises } from '@/modules/programs';
import { Card, FadeInItem, Icon, Typography } from '@/shared/ui';
import { COLORS, motion, radius, spacing } from '@/theme';
import { formatSetsLine } from '@/modules/workout';

interface WorkoutListItemProps {
  workout: WorkoutWithExercises;
  index: number;
  expanded: boolean;
  // Следующая по плану тренировка — та же, что «Сегодня» на главной.
  isCurrent?: boolean;
  // Пройдена в текущем круге программы — подпись дня приглушена.
  isDone?: boolean;
  onToggle: () => void;
  onStartWorkout: (workout: WorkoutWithExercises) => void;
}

export function WorkoutListItem({
  workout,
  index,
  expanded,
  isCurrent = false,
  isDone = false,
  onToggle,
  onStartWorkout,
}: WorkoutListItemProps) {
  return (
    <FadeInItem index={index}>
      <Animated.View layout={LinearTransition.duration(motion.fast)}>
        <Card
          style={[styles.card, isCurrent && styles.cardCurrent]}
          onPress={onToggle}
        >
          <View style={styles.workoutRow}>
            {/*<View style={styles.dayBadge}>*/}
            {/*  <Typography variant="title" color={COLORS.Text.accent}>*/}
            {/*    {workout.dayNumber}*/}
            {/*  </Typography>*/}
            {/*</View>*/}

            <View style={styles.exerciseHeader}>
              <Typography
                variant="subtitle"
                color={isDone ? COLORS.Text.secondary : COLORS.Text.primary}
                accessibilityLabel={
                  isDone ? `День ${workout.dayNumber}, пройдена` : undefined
                }
              >
                День {workout.dayNumber}
              </Typography>

              {isCurrent ? (
                <View style={styles.todayBadge}>
                  <Typography variant="caption" color={COLORS.Text.accent}>
                    {'Сегодня'}
                  </Typography>
                </View>
              ) : null}
            </View>

            {isCurrent ? (
              <Pressable
                onPress={() => onStartWorkout(workout)}
                accessibilityRole="button"
                hitSlop={spacing.sm}
                style={styles.startButton}
              >
                <Typography variant="subtitle" color={COLORS.Text.inverse}>
                  {'Начать'}
                </Typography>
              </Pressable>
            ) : (
              <Typography
                variant="body"
                color={COLORS.Text.accent}
                onPress={() => onStartWorkout(workout)}
              >
                {'Выбрать'}
              </Typography>
            )}

            <MotiView
              animate={{ rotate: expanded ? '180deg' : '0deg' }}
              transition={{ type: 'timing', duration: motion.fast }}
            >
              <Icon
                name="chevron-down"
                size={32}
                color={COLORS.Icon.tertiary}
              />
            </MotiView>
          </View>

          {expanded ? (
            <Animated.View
              style={styles.exercisesList}
              entering={FadeIn.duration(motion.fast)}
              exiting={FadeOut.duration(motion.fast)}
            >
              {workout.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseRow}>
                  {exercise.thumbnailUrl ? (
                    <Image
                      source={{ uri: exercise.thumbnailUrl }}
                      style={styles.exerciseThumb}
                    />
                  ) : (
                    <View
                      style={[
                        styles.exerciseThumb,
                        styles.exerciseThumbPlaceholder,
                      ]}
                    >
                      <Typography
                        variant="heading"
                        color={COLORS.Text.tertiary}
                      >
                        {exercise.name.charAt(0).toUpperCase()}
                      </Typography>
                    </View>
                  )}

                  <View style={styles.exerciseText}>
                    <Typography variant="subtitle">{exercise.name}</Typography>

                    <Typography variant="body" color={COLORS.Text.secondary}>
                      {formatSetsLine(exercise)}
                    </Typography>
                  </View>
                </View>
              ))}
            </Animated.View>
          ) : null}
        </Card>
      </Animated.View>
    </FadeInItem>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  cardCurrent: { borderColor: COLORS.Stroke.accent },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  todayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.accentSubdued,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  exercisesList: {
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.Stroke.hairline,
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  exerciseThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.xs,
    backgroundColor: COLORS.Surface.secondary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    overflow: 'hidden',
  },
  exerciseThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseText: {
    flex: 1,
    gap: 2,
  },
  exerciseNotes: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  startButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.accent,
  },
});
