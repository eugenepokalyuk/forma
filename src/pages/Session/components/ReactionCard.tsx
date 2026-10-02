import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { ReactionType } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { COLORS, motion, radius, spacing } from '@/theme';

interface ReactionCardProps {
  reaction: ReactionType;
  selected: boolean;
  onPress: () => void;
}

export function ReactionCard({
  reaction,
  selected,
  onPress,
}: ReactionCardProps) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityLabel={reaction.label}
      accessibilityState={{ selected }}
      style={styles.cell}
    >
      <MotiView
        animate={{
          borderColor: selected ? COLORS.Stroke.accent : COLORS.Stroke.primary,
          scale: selected ? 1 : 0.97,
        }}
        transition={motion.springy}
        style={styles.card}
      >
        <Text style={styles.emoji}>{reaction.emoji}</Text>

        <Typography
          variant="subtitle"
          color={selected ? COLORS.Text.primary : COLORS.Text.secondary}
        >
          {reaction.label}
        </Typography>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Две карточки в ряд: каждая тянется на половину ряда минус gap сетки.
  cell: { flexBasis: '40%', flexGrow: 1 },
  card: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: COLORS.Surface.primary,
  },
  emoji: { fontSize: 56, lineHeight: 64 },
});
