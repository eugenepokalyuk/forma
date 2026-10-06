import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

import type { Program } from '../models/program';
import { useReactions } from '../queries';

interface ProgramReactionsProps {
  program: Program;
  style?: StyleProp<ViewStyle>;
}

// Реакции на программу — только те, что кто-то поставил, в порядке справочника.
// Нет ни одной — ничего не рисуем. Общие для карточек каталога, обложки и
// страницы программы; раскладку (перенос, отступы) задаёт style.
export function ProgramReactions({ program, style }: ProgramReactionsProps) {
  const { data: reactionTypes } = useReactions();

  const reactions = (reactionTypes ?? [])
    .filter((r) => (program.reactionCounts?.[r.value] ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  if (reactions.length === 0) return null;

  return (
    <View style={[styles.row, style]}>
      {reactions.map((r) => (
        <View key={r.value} style={styles.chip}>
          <Typography variant="label">{r.emoji}</Typography>

          <Typography variant="label" color={COLORS.Text.primary}>
            {program.reactionCounts[r.value]}
          </Typography>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
