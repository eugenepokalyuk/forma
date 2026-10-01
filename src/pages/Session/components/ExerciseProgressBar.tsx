import { MotiView } from 'moti';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, motion, spacing } from '@/theme';

interface ExerciseProgressBarProps {
  total: number;
  index: number;
  onPressSegment: (index: number) => void;
}

const ACTIVE_SCALE = 6;

export function ExerciseProgressBar({
  total,
  index,
  onPressSegment,
}: ExerciseProgressBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
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
                backgroundColor:
                  i <= index ? COLORS.Surface.accent : COLORS.Surface.secondary,
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
