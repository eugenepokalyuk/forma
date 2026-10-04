import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, motion } from '@/theme';

export type SegmentState = 'current' | 'done' | 'skipped' | 'pending';

interface ExerciseProgressBarProps {
  // По сегменту на упражнение.
  states: SegmentState[];
  onPressSegment: (index: number) => void;
}

const ACTIVE_SCALE = 6;

// Текущее — жёлтое, выполненное — зелёное, пропущенное — красное, остальные —
// серые (в том числе недоделанные позади).
const COLOR: Record<SegmentState, string> = {
  current: COLORS.Surface.accent,
  done: COLORS.Surface.positive,
  skipped: COLORS.Text.negative,
  pending: COLORS.Surface.secondary,
};

const LABEL: Record<SegmentState, string> = {
  current: ', текущее',
  done: ', выполнено',
  skipped: ', пропущено',
  pending: '',
};

// Полоса упражнений тренировки: текущее — широкий сегмент.
export function ExerciseProgressBar({
  states,
  onPressSegment,
}: ExerciseProgressBarProps) {
  return (
    <View style={styles.row}>
      {states.map((state, i) => (
        <MotiView
          key={i}
          animate={{ flex: state === 'current' ? ACTIVE_SCALE : 1 }}
          transition={{ type: 'timing', duration: motion.fast }}
        >
          <Pressable
            onPress={() => onPressSegment(i)}
            style={styles.segmentHit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Упражнение ${i + 1} из ${states.length}${LABEL[state]}`}
            accessibilityState={{ selected: state === 'current' }}
          >
            <MotiView
              animate={{ backgroundColor: COLOR[state] }}
              transition={{ type: 'timing', duration: motion.fast }}
              style={styles.segment}
            />
          </Pressable>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, paddingBottom: 10 },
  segmentHit: { paddingVertical: 6 },
  segment: { height: 1, borderRadius: 0 },
});
