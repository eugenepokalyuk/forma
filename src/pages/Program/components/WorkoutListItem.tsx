import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import type { WorkoutWithExercises } from '@/modules/programs';
import { Badge, Card, FadeInItem, Icon, Typography } from '@/shared/ui';
import { COLORS, motion, radius, spacing } from '@/theme';
import { WorkoutExercises } from '@/modules/workout/ui';

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

              {isCurrent ? <Badge label="Сегодня" /> : null}
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
              <WorkoutExercises exercises={workout.exercises} />
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
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  exercisesList: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.Stroke.hairline,
  },
  startButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.accent,
  },
});
