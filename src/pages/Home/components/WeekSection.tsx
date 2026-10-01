import { Section, Typography } from '@/components/ui';
import { WeekStrip } from '@/pages/Home/components/WeekStrip';
import { useTrainedDates } from '@/pages/Home/hooks/useTrainedDates';
import { COLORS, spacing } from '@/theme';
import { formatMonthLabel } from '@/utils/helpers/date/calendar';

export function WeekSection() {
  const trainedDates = useTrainedDates();

  return (
    <Section>
      <Typography
        variant="label"
        color={COLORS.Text.tertiary}
        style={{ marginBottom: spacing.sm }}
      >
        {formatMonthLabel()}
      </Typography>

      <WeekStrip trainedDates={trainedDates} />
    </Section>
  );
}
