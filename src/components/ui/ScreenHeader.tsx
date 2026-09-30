import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { COLORS, spacing } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

// Заголовок экрана — без своего горизонтального паддинга: рассчитан на то,
// что уже сидит внутри ScreenContainer (тот и задаёт единый отступ).
export function ScreenHeader({ title, subtitle, trailing }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Typography variant="display">{title}</Typography>

        {subtitle ? (
          <Typography variant="body" color={COLORS.Text.secondary}>
            {subtitle}
          </Typography>
        ) : null}
      </View>

      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
