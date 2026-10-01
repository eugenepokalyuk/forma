import * as React from 'react';

import { Section } from '@/components/ui';
import { TipsCarousel } from '@/pages/Home/components/TipsCarousel';
import { useTodayWorkout } from '@/pages/Home/hooks/useTodayWorkout';
import { useTrainedDates } from '@/pages/Home/hooks/useTrainedDates';
import { useUserPrograms } from '@/pages/Home/hooks/useUserPrograms';
import { useAuthStore } from '@/store/auth';
import { getWeeklyGoal } from '@/utils/helpers/bro/broMessages';
import { getCurrentWeek, isSameDay } from '@/utils/helpers/date/calendar';

// Карточки Фитнес Бро: контекст «сегодня» и цель недели.
export function BroSection() {
  const workoutFrequency = useAuthStore((s) => s.user?.workoutFrequency);
  const { activeProgram } = useUserPrograms();
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
