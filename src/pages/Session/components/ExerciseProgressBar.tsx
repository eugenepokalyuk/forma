import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, motion } from '@/theme';

interface ExerciseProgressBarProps {
  // По сегменту на упражнение: true — все подходы выполнены.
  done: boolean[];
  index: number;
  onPressSegment: (index: number) => void;
}

const ACTIVE_SCALE = 6;

// Полоса упражнений тренировки: текущее — широкий сегмент, выполненные —
// жёлтые. Пропущенные и недоделанные остаются серыми, даже если они позади.
export function ExerciseProgressBar({
  done,
  index,
  onPressSegment,
}: ExerciseProgressBarProps) {
  return (
    <View style={styles.row}>
      {done.map((isDone, i) => (
        <MotiView
          key={i}
          animate={{ flex: i === index ? ACTIVE_SCALE : 1 }}
          transition={{ type: 'timing', duration: motion.fast }}
        >
          <Pressable
            onPress={() => onPressSegment(i)}
            style={styles.segmentHit}
            hitSlop={6}
          >
            <MotiView
              animate={{
                backgroundColor: isDone
                  ? COLORS.Surface.accent
                  : COLORS.Surface.secondary,
              }}
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
