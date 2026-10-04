import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ProgramWeek } from '@/modules/programs';
import { WeekPill } from '@/pages/Program/components/WeekPill';
import { screenPadding, spacing } from '@/theme';

interface WeekSliderProps {
  weeks: ProgramWeek[];
  selected: number;
  // Неделя текущего дня — до неё слайдер доезжает сам.
  currentWeek: number | undefined;
  onSelect: (weekNumber: number) => void;
}

// Горизонтальный ряд недель программы.
export function WeekSlider({
  weeks,
  selected,
  currentWeek,
  onSelect,
}: WeekSliderProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const didScroll = React.useRef(false);

  // Доезжаем один раз, при первой раскладке, чтобы не дёргать слайдер,
  // когда пользователь листает.
  const onWeekLayout = (weekNumber: number, x: number) => {
    if (didScroll.current || weekNumber !== currentWeek) return;
    didScroll.current = true;
    scrollRef.current?.scrollTo({
      x: Math.max(0, x - screenPadding),
      animated: false,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {weeks.map((w) => (
        <View
          key={w.weekNumber}
          onLayout={(e) => onWeekLayout(w.weekNumber, e.nativeEvent.layout.x)}
        >
          <WeekPill
            week={w}
            active={selected === w.weekNumber}
            onPress={() => onSelect(w.weekNumber)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Отступы — у содержимого, а не у самого ScrollView: иначе последняя
  // неделя прилипает к правому краю при прокрутке до конца.
  row: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
});
