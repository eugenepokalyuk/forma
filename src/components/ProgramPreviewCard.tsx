import * as ReactQuery from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { getReactionsApi } from '@/api';
import type { Program } from '@/api';
import { Typography } from '@/components/ui';
import { COLORS, gradients, radius, screenPadding, spacing } from '@/theme';
import { formatProgramSubtitle } from '@/utils/helpers/program/formatProgramSubtitle';
import { ROUTES } from '@/utils/constants/routes';

interface ProgramPreviewCardProps {
  program: Program;
}

// Единственная закреплённая карточка каталога — во всю ширину устройства,
// а не контейнера (см. отрицательный marginHorizontal), поэтому ширину
// берём из окна, а не из процентов родителя. Верхние углы остаются острыми
// (карточка примыкает к краям экрана), скруглены только нижние.
export function ProgramPreviewCard({ program }: ProgramPreviewCardProps) {
  const { width } = useWindowDimensions();

  const { data: reactionTypes } = ReactQuery.useQuery({
    queryKey: ['reactions'],
    queryFn: getReactionsApi,
    staleTime: Infinity,
  });

  const reactions = (reactionTypes ?? [])
    .filter((r) => (program.reactionCounts?.[r.value] ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  return (
    <Pressable
      onPress={() => router.push(ROUTES.program(program.id))}
      style={[styles.wrap, { width, marginHorizontal: -screenPadding }]}
    >
      {program.coverImageUrl ? (
        <Image
          source={{ uri: program.coverImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}

      <LinearGradient
        colors={gradients.scrim}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Typography variant="display" numberOfLines={2}>
          {program.title}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          numberOfLines={2}
          style={styles.description}
        >
          {formatProgramSubtitle(program)}
        </Typography>

        {reactions.length > 0 ? (
          <View style={styles.reactions}>
            {reactions.map((r) => (
              <View key={r.value} style={styles.reactionChip}>
                <Typography variant="subtitle">{r.emoji}</Typography>

                <Typography variant="subtitle" color={COLORS.Text.secondary}>
                  {program.reactionCounts[r.value]}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 330,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.Surface.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  fallback: { backgroundColor: COLORS.Surface.secondary },
  content: {
    paddingHorizontal: screenPadding + spacing.md,
    paddingBottom: spacing.lg,
  },
  description: { marginTop: 4 },
  reactions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.Surface.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
