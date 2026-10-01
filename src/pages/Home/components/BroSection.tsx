import * as React from 'react';

import { Section } from '@/shared/ui';
import { getWeeklyGoal } from '@/modules/bro';
import { TipsCarousel } from '@/modules/bro/ui';
import { useTodayWorkout } from '@/pages/Home/hooks/useTodayWorkout';
import { useTrainedDates } from '@/pages/Home/hooks/useTrainedDates';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';
import { useAuthStore } from '@/modules/auth';
import { getCurrentWeek, isSameDay } from '@/shared/lib/date/calendar';

// Карточки Фитнес Бро: контекст «сегодня» и цель недели.
export function BroSection() {
  const workoutFrequency = useAuthStore((s) => s.user?.workoutFrequency);
  const { activeProgram } = useMyPrograms();
  const trainedDates = useTrainedDates();
  const today = useTodayWorkout(activeProgram);

  const daysTrainedThisWeek = getCurrentWeek().filter((d) =>
    trainedDates.some((t) => isSameDay(t, d.date)),
  ).length;

  const weeklyGoal = React.useMemo(
    () => getWeeklyGoal(workoutFrequency, daysTrainedThisWeek),
    [workoutFrequency, daysTrainedThisWeek],
  );

  return (
    <Section>
      <TipsCarousel today={today} weeklyGoal={weeklyGoal} />
    </Section>
  );
}
