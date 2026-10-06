import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Program } from '@/modules/programs';
import { Card, Icon, ProBadge, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatProgramSubtitle, useReactions } from '@/modules/programs';
import { ROUTES } from '@/shared/constants/routes';

interface ProgramMediumCardProps {
  program: Program;
  style?: StyleProp<ViewStyle>;
}

// Карточка каталога 1/2 ширины — без рамки и фона: обложка на всю ширину,
// бейдж ПРО на ней в правом нижнем углу, под обложкой заголовок, описание
// и реакции.
export function ProgramMediumCard({ program, style }: ProgramMediumCardProps) {
  const { data: reactionTypes } = useReactions();

  const reactions = (reactionTypes ?? [])
    .filter((r) => (program.reactionCounts?.[r.value] ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

  const isPro = program.tier === 'pro';

  return (
    // Обёртка нужна отдельно от Card: Card рендерит Pressable без стилей
    // снаружи и MotiView со стилями внутри, поэтому flex/width, переданный
    // прямо в Card.style, не долетает до реального flex-элемента строки —
    // ширина карточки в ряду берётся с этой внешней View.
    <View style={style}>
      <Card
        style={styles.card}
        onPress={() => router.push(ROUTES.program(program.id))}
      >
        <View style={styles.cover}>
          {program.coverImageUrl ? (
            <Image
              source={{ uri: program.coverImageUrl }}
              style={styles.coverImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Icon name="dumbbell" size={36} color={COLORS.Icon.tertiary} />
            </View>
          )}

          {isPro ? <ProBadge style={styles.proBadge} /> : null}
        </View>

        <View style={styles.textCard}>
          <Typography
            variant="title"
            align="left"
            numberOfLines={2}
            style={styles.title}
          >
            {program.title}
          </Typography>

          <Typography
            variant="body"
            color={COLORS.Text.secondary}
            align="left"
            numberOfLines={2}
          >
            {formatProgramSubtitle(program)}
          </Typography>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 314,
    gap: spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  textCard: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  // Обложка на всю ширину карточки, квадратная.
  cover: { width: '100%', aspectRatio: 1 },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.secondary,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.xs,
  },
  // Бейдж ПРО — на обложке в правом нижнем углу.
  proBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
  },
  // Реакции под текстом, прижаты к низу карточки.
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingTop: spacing.sm,
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
