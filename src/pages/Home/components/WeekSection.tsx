import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { Icon, Section, TextButton, Typography } from '@/shared/ui';
import { WeekStrip } from '@/pages/Home/components/WeekStrip';
import { useTrainedDates } from '@/pages/Home/hooks/useTrainedDates';
import { useSessions, sessionDate } from '@/modules/workout';
import { COLORS, spacing } from '@/theme';
import {
  formatMonthLabel,
  getWeek,
  isSameDay,
  weekOffsetOf,
} from '@/shared/lib/date/calendar';

// Вперёд — только на следующую неделю: дальше планировать нечего.
const MAX_WEEK_OFFSET = 1;
// Свайп по полосе дней короче этого — не листание.
const SWIPE_DISTANCE = 40;
const TAP_SLOP = 10;

interface WeekSectionProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

// Неделя тренировок: тап по дню — выбрать его, стрелки и свайп — соседняя
// неделя (тот же день недели). Назад — до недели первой тренировки.
export function WeekSection({ selectedDate, onSelect }: WeekSectionProps) {
  const trainedDates = useTrainedDates();
  const { data: sessions } = useSessions();

  const weekOffset = weekOffsetOf(selectedDate);
  const days = React.useMemo(() => getWeek(weekOffset), [weekOffset]);

  const minWeekOffset = React.useMemo(() => {
    const first = Math.min(
      ...(sessions ?? []).map((s) => sessionDate(s).getTime()),
    );
    return Number.isFinite(first)
      ? Math.min(0, weekOffsetOf(new Date(first)))
      : 0;
  }, [sessions]);

  const canGoBack = weekOffset > minWeekOffset;
  const canGoForward = weekOffset < MAX_WEEK_OFFSET;
  const isTodaySelected = isSameDay(selectedDate, new Date());

  const shiftWeek = (direction: -1 | 1) => {
    if (direction < 0 ? !canGoBack : !canGoForward) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * 7);
    onSelect(next);
  };

  // Свайп по полосе дней — листание недель. Касания, а не responder: тапы
  // по дням и вертикальная прокрутка экрана работают как раньше.
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  // Палец сдвинулся по горизонтали — это свайп, а не тап по дню под ним.
  const swiping = React.useRef(false);

  const onTouchStart = (e: GestureResponderEvent) => {
    touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    swiping.current = false;
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    const start = touchStart.current;
    if (start && Math.abs(e.nativeEvent.pageX - start.x) > TAP_SLOP) {
      swiping.current = true;
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.nativeEvent.pageX - start.x;
    const dy = e.nativeEvent.pageY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }
    shiftWeek(dx < 0 ? 1 : -1);
  };

  return (
    <Section padding>
      <View style={styles.header}>
        <Typography variant="label" color={COLORS.Text.tertiary}>
          {formatMonthLabel(selectedDate)}
        </Typography>

        <View style={styles.nav}>
          {isTodaySelected ? null : (
            <TextButton
              title="Сегодня"
              tone="accent"
              onPress={() => onSelect(new Date())}
            />
          )}

          <WeekArrow
            icon="chevron-left"
            label="Предыдущая неделя"
            disabled={!canGoBack}
            onPress={() => shiftWeek(-1)}
          />
          <WeekArrow
            icon="chevron-right"
            label="Следующая неделя"
            disabled={!canGoForward}
            onPress={() => shiftWeek(1)}
          />
        </View>
      </View>

      <View
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => (touchStart.current = null)}
      >
        <WeekStrip
          days={days}
          selectedDate={selectedDate}
          trainedDates={trainedDates}
          onSelect={(date) => {
            if (!swiping.current) onSelect(date);
          }}
        />
      </View>
    </Section>
  );
}

interface WeekArrowProps {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function WeekArrow({ icon, label, disabled, onPress }: WeekArrowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Icon
        name={icon}
        size={24}
        color={disabled ? COLORS.Surface.tertiary : COLORS.Icon.secondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
