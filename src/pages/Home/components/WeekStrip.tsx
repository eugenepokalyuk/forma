import { StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/ui';
import { getCurrentWeek, isSameDay } from '@/shared/lib/date/calendar';
import { COLORS, spacing } from '@/theme';

interface WeekStripProps {
  trainedDates: Date[];
}

export function WeekStrip({ trainedDates }: WeekStripProps) {
  const days = getCurrentWeek();

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const trained = trainedDates.some((d) => isSameDay(d, day.date));

        const isToday = day.isToday
          ? COLORS.Text.primary
          : COLORS.Text.tertiary;

        return (
          <View key={day.date.toISOString()} style={styles.col}>
            <Typography variant="body" color={isToday}>
              {day.label}
            </Typography>

            <Typography variant="title" color={isToday}>
              {day.dayNumber}
            </Typography>

            <View
              style={[
                styles.underline,
                day.isToday && styles.underlineActive,
                trained && styles.underlinePositive,
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { alignItems: 'flex-start', gap: spacing.xs, minWidth: 50 },
  underline: {
    width: '100%',
    height: 1,
    borderRadius: 1.5,
    backgroundColor: COLORS.Text.tertiary,
  },
  underlineActive: { backgroundColor: COLORS.Text.primary },
  underlinePositive: { backgroundColor: COLORS.Text.positive },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  dotActive: { backgroundColor: COLORS.Text.positive },
});
