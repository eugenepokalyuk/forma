import type { Exercise } from '@/api/types';
import { Typography } from '@/components/ui';
import { formatTargetLabel } from '@/utils/format';
import { COLORS } from '@/theme';

// Цель подхода — простой текст без бейджа и иконки («8–12 повторов»).
export function SetTargetLabel({ exercise }: { exercise: Exercise }) {
  return (
    <Typography variant="display" color={COLORS.Text.secondary}>
      {formatTargetLabel(exercise)}
    </Typography>
  );
}
