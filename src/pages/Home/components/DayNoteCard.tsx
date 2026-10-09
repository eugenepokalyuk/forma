import { StyleSheet, View } from 'react-native';

import { Section, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

interface DayNoteCardProps {
  title: string;
  message: string;
}

// Выбранный в неделе день без тренировки: что здесь и почему.
export function DayNoteCard({ title, message }: DayNoteCardProps) {
  return (
    <Section padding>
      <View style={styles.card}>
        <Typography variant="title">{title}</Typography>

        <Typography variant="body" color={COLORS.Text.secondary}>
          {message}
        </Typography>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    padding: spacing.md,
  },
});
