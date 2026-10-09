import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/ui';
import { isSameDay, type WeekDay } from '@/shared/lib/date/calendar';
import { COLORS, spacing } from '@/theme';

interface WeekStripProps {
  days: WeekDay[];
  selectedDate: Date;
  trainedDates: Date[];
  onSelect: (date: Date) => void;
}

export function WeekStrip({
  days,
  selectedDate,
  trainedDates,
  onSelect,
}: WeekStripProps) {
  return (
    <View style={styles.row}>
      {days.map((day) => {
        const trained = trainedDates.some((d) => isSameDay(d, day.date));
        const selected = isSameDay(selectedDate, day.date);

        // Выбранный день — ярче всех; сегодня, когда смотрим другой день, —
        // чуть ярче остальных, чтобы было куда вернуться.
        const color = selected
          ? COLORS.Text.primary
          : day.isToday
            ? COLORS.Text.secondary
            : COLORS.Text.tertiary;

        return (
          <Pressable
            key={day.date.toISOString()}
            style={styles.col}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel={day.date.toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              void Haptics.selectionAsync();
              onSelect(day.date);
            }}
          >
            <Typography variant="body" color={color}>
              {day.label}
            </Typography>

            <Typography variant="title" color={color}>
              {day.dayNumber}
            </Typography>

            <View
              style={[
                styles.underline,
                selected && styles.underlineSelected,
                trained && styles.underlinePositive,
              ]}
            />
          </Pressable>
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
  underlineSelected: { height: 3, backgroundColor: COLORS.Text.primary },
  underlinePositive: { backgroundColor: COLORS.Text.positive },
});
