import * as ReactQuery from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { getReactionsApi } from '@/api';
import type { Program } from '@/api';
import { Card } from '@/components/Card';
import { Icon, Typography } from '@/components/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatProgramSubtitle } from '@/utils/helpers/program/formatProgramSubtitle';
import { ROUTES } from '@/utils/constants/routes';

interface ProgramMediumCardProps {
  program: Program;
  style?: StyleProp<ViewStyle>;
}

// Карточка каталога 1/2 ширины — аватар программы в кружке, заголовок,
// описание и реакции под ним (forma-project Figma, каталог, тип medium).
export function ProgramMediumCard({ program, style }: ProgramMediumCardProps) {
  const { data: reactionTypes } = ReactQuery.useQuery({
    queryKey: ['reactions'],
    queryFn: getReactionsApi,
    staleTime: Infinity,
  });

  const reactions = (reactionTypes ?? [])
    .filter((r) => (program.reactionCounts?.[r.value] ?? 0) > 0)
    .sort((a, b) => a.order - b.order);

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
        {program.coverImageUrl ? (
          <Image
            source={{ uri: program.coverImageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon name="dumbbell" size={36} color={COLORS.Icon.tertiary} />
          </View>
        )}

        <Typography
          variant="title"
          align="center"
          numberOfLines={2}
          style={styles.title}
        >
          {program.title}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          align="center"
          numberOfLines={2}
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
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 314,
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: COLORS.Surface.secondary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: spacing.xs },
  reactions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingTop: spacing.xs,
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
