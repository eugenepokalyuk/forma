import * as ReactQuery from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { getReactions } from '@/api/reactions';
import type { Program } from '@/api/types';
import { Card } from '@/components/Card';
import { Icon, Typography } from '@/components/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatProgramSubtitle } from '@/utils/format';
import { ROUTES } from '@/utils/routes';

// Сумма всех реакций программы — для сортировки каталога по популярности.
export function totalReactions(program: Program): number {
  return Object.values(program.reactionCounts ?? {}).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );
}

interface ProgramCardProps {
  program: Program;
  /** «Активна» — только для списка «Мои программы» на главном. */
  active?: boolean;
}

// Единая карточка программы — раньше в каталоге и в «Мои программы» на
// главном были два разных вида карточек, теперь один компонент везде
// (см. forma-project Figma, node 5487-2731).
export function ProgramCard({ program, active }: ProgramCardProps) {
  const { data: reactionTypes } = ReactQuery.useQuery({
    queryKey: ['reactions'],
    queryFn: getReactions,
    staleTime: Infinity,
  });

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

          {isPro || active ? (
            <View style={styles.badgeRow}>
              {isPro ? (
                <View style={styles.proBadge}>
                  <Icon name="crown" size={11} color={COLORS.Text.inverse} />

                  <Typography variant="caption" color={COLORS.Text.inverse}>
                    {'ПРО'}
                  </Typography>
                </View>
              ) : null}
              {active ? (
                <View style={styles.activeBadge}>
                  <Typography variant="caption" color={COLORS.Text.positive}>
                    {'Активна'}
                  </Typography>
                </View>
              ) : null}
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

        <Icon name="chevron-right" size={32} color={COLORS.Icon.tertiary} />
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
  cardClip: { overflow: 'hidden' },
  coverTint: { backgroundColor: COLORS.Overlay.tint },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  title: { flexShrink: 1 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  subtitle: { marginTop: 4 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.Surface.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  activeBadge: {
    backgroundColor: COLORS.Surface.positiveSubdued,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  reactions: { flexDirection: 'row', gap: spacing.sm },
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
