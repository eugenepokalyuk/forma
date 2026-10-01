import { useSessions } from '@/queries/sessions';
import { computeStreak } from '@/utils/helpers/date/calendar';

// Итоги профиля по завершённым тренировкам: серия, количество, тоннаж.
export function useProfileStats() {
  const query = useSessions();

  const completed = (query.data ?? []).filter((s) => s.status === 'completed');
  const totalTonnage = completed.reduce(
    (sum, s) =>
      sum +
      s.exerciseLogs.reduce(
        (a, l) => a + (l.weight ?? 0) * (l.repsDone ?? 0),
        0,
      ),
    0,
  );
  const streak = computeStreak(
    completed
      .filter((s) => s.completedAt)
      .map((s) => new Date(s.completedAt as string)),
  );

  return {
    ...query,
    streak,
    workoutsCount: completed.length,
    totalTonnage,
  };
}
