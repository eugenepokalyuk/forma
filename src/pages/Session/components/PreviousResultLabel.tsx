import { formatLastLog, type LastLog } from '@/modules/workout';
import { Typography } from '@/shared/ui';
import { COLORS } from '@/theme';

// «Прошлый раз: 50 кг × 8» — ничего не рендерит, если истории ещё нет.
export function PreviousResultLabel({
  lastLog,
}: {
  lastLog: LastLog | undefined;
}) {
  if (!lastLog) return null;

  return (
    <Typography variant="body" color={COLORS.Text.secondary}>
      Прошлый раз: {formatLastLog(lastLog)}
    </Typography>
  );
}
