import type { LastLog } from '@/modules/workout';
import { Typography } from '@/shared/ui';
import { COLORS } from '@/theme';
import { formatMMSS } from '@/shared/lib/string/number';

// «Прошлый раз: 50 кг × 8» — ничего не рендерит, если истории ещё нет.
export function PreviousResultLabel({
  lastLog,
}: {
  lastLog: LastLog | undefined;
}) {
  if (!lastLog) return null;

  return (
    <Typography
      variant="body"
      color={COLORS.Text.secondary}
      align="center"
      style={{ fontSize: 14 }}
    >
      Прошлый раз:{' '}
      {lastLog.weight != null
        ? `${lastLog.weight} кг × ${lastLog.repsDone}`
        : formatMMSS(lastLog.durationSeconds ?? 0)}
    </Typography>
  );
}
