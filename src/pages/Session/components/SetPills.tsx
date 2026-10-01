import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Exercise } from '@/modules/programs';
import { Icon, Typography } from '@/shared/ui';
import { COLORS, motion, radius, spacing } from '@/theme';
import { nextSetNumber, undoSet, useSessionStore } from '@/modules/workout';

interface SetPillsProps {
  exercise: Exercise;
  totalSets: number;
  onAddSet: () => void;
  /** Убрать последний добавленный вручную (сверх плана) подход. */
  onRemoveExtraSet: () => void;
}

export function SetPills({
  exercise,
  totalSets,
  onAddSet,
  onRemoveExtraSet,
}: SetPillsProps) {
  const active = useSessionStore((s) => s.active);

  if (!active) return null;

  const logs = active.logs.filter(
    (l) => l.exerciseId === exercise.id && !l.skipped,
  );
  const currentSetNumber = nextSetNumber(exercise.id, active.logs);

  return (
    <View style={styles.pillsRow}>
      {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNumber) => {
        const done = logs.some((l) => l.setNumber === setNumber);
        const isCurrent = !done && setNumber === currentSetNumber;
        // Последний подход сверх плана программы (добавлен через «+») — не
        // сделан, значит его можно убрать тем же тапом.
        const isRemovableExtra =
          !done && setNumber > exercise.sets && setNumber === totalSets;

        return (
          <Pressable
            key={setNumber}
            disabled={!done && !isRemovableExtra}
            accessibilityRole="button"
            accessibilityLabel={
              done
                ? `Подход ${setNumber} выполнен`
                : isRemovableExtra
                  ? `Убрать подход ${setNumber}`
                  : `Подход ${setNumber}${isCurrent ? ', текущий' : ''}`
            }
            accessibilityHint={done ? 'Отменить подход' : undefined}
            accessibilityState={{ disabled: !done && !isRemovableExtra }}
            onPress={() => {
              void Haptics.selectionAsync();
              if (done) {
                undoSet(exercise.id, setNumber);
              } else {
                onRemoveExtraSet();
              }
            }}
          >
            <MotiView
              animate={{}}
              transition={motion.springy}
              style={[
                styles.pill,
                done && styles.pillDone,
                isCurrent && styles.pillCurrent,
                isRemovableExtra && styles.pillRemovable,
              ]}
            >
              {done ? (
                <Typography variant="label" color={COLORS.Text.positive}>
                  {setNumber}
                </Typography>
              ) : isRemovableExtra ? (
                <Icon name="close" size={18} color={COLORS.Text.negative} />
              ) : (
                <Typography variant="label" color={COLORS.White}>
                  {setNumber}
                </Typography>
              )}
            </MotiView>
          </Pressable>
        );
      })}

      <Pressable
        onPress={onAddSet}
        style={styles.addPill}
        accessibilityRole="button"
        accessibilityLabel="Добавить подход"
      >
        <Icon name="plus" size={18} color={COLORS.Text.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,

    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',

    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDone: {
    backgroundColor: COLORS.Surface.positiveSubdued,
    borderColor: COLORS.Surface.positiveSubdued,
  },
  pillCurrent: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pillRemovable: {
    borderStyle: 'dashed',
    borderColor: COLORS.Stroke.negative,
  },
  addPill: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,

    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.Stroke.accent,

    alignItems: 'center',
    justifyContent: 'center',
  },
});
