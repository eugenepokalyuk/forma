import { MotiView } from 'moti';
import { Pressable, StyleSheet } from 'react-native';

import type { ProgramWeek } from '@/api/types';
import { Typography } from '@/components/ui';
import { COLORS, motion, radius } from '@/theme';

interface WeekPillProps {
  week: ProgramWeek;
  active: boolean;
  onPress: () => void;
}

export function WeekPill({ week, active, onPress }: WeekPillProps) {
  return (
    <Pressable onPress={onPress}>
      <MotiView
        animate={{
          backgroundColor: active ? COLORS.Surface.primary : COLORS.Black,
          borderColor: active ? COLORS.Stroke.primary : COLORS.Surface.primary,
        }}
        transition={{ type: 'timing', duration: motion.fast }}
        style={styles.pill}
      >
        <Typography variant="subtitle" color={COLORS.Text.primary}>
          {`Неделя ${week.weekNumber}. ${week.intensityLabel ? week.intensityLabel : null}`}
        </Typography>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
});
