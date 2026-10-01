import type { Exercise } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { formatTargetLabel } from '@/modules/workout';
import { COLORS } from '@/theme';

// Цель подхода — простой текст без бейджа и иконки («8–12 повторов»).
export function SetTargetLabel({ exercise }: { exercise: Exercise }) {
  return (
    <Typography variant="display" color={COLORS.Text.secondary}>
      {formatTargetLabel(exercise)}
    </Typography>
  );
}
