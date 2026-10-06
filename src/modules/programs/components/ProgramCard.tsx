import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Program } from '../models/program';
import { Card, ProBadge, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatProgramSubtitle } from '../helpers/formatProgramSubtitle';
import { ROUTES } from '@/shared/constants/routes';
import { useReactions } from '../queries';

interface ProgramCardProps {
  program: Program;
}

// Единая карточка программы — раньше в каталоге и в «Мои программы» на
// главном были два разных вида карточек, теперь один компонент везде
// (см. forma-project Figma, node 5487-2731).
export function ProgramCard({ program }: ProgramCardProps) {
  const { data: reactionTypes } = useReactions();

  const reactions = (reactionTypes ?? [])
    .filter((r) => (program.reactionCounts?.[r.value] ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  const subtitle = formatProgramSubtitle(program);
  const isPro = program.tier === 'pro';

  return (
    <Card
      style={[styles.card, styles.cardClip]}
      onPress={() => router.push(ROUTES.program(program.id))}
    >
      {program.coverImageUrl ? (
        <>
          <Image
            source={{ uri: program.coverImageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={[StyleSheet.absoluteFill, styles.coverTint]} />
        </>
      ) : null}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Typography variant="display" style={styles.title} numberOfLines={2}>
            {program.title}
          </Typography>

          {isPro ? (
            <View style={styles.badgeRow}>
              <ProBadge />
            </View>
          ) : null}

          <Typography
            variant="body"
            color={COLORS.Text.secondary}
            style={styles.subtitle}
          >
            {subtitle}
          </Typography>
        </View>
      </View>

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
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 230,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.primary,
    justifyContent: 'space-between',
    borderWidth: 0,
  },
  cardClip: {
    overflow: 'hidden',
  },
  coverTint: {
    backgroundColor: COLORS.Overlay.tint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  reactions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
