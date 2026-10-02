import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Typography } from '@/shared/ui';
import { COLORS, gradients, spacing } from '@/theme';

import { formatProgramSubtitle } from '../helpers/formatProgramSubtitle';
import type { Program } from '../models/program';
import { ProgramReactions } from './ProgramReactions';

interface ProgramPreviewCardProps {
  program: Program;
  // Насколько снизу на карточку заходит следующий за ней контент — текст
  // поднимаем на столько же, чтобы его не закрыло.
  bottomOverlap?: number;
  // Без onPress карточка не нажимается — так она стоит шапкой на странице
  // самой программы.
  onPress?: () => void;
  // Что показать под подзаголовком вместо реакций (например, кнопку).
  footer?: ReactNode;
}

// Обложка программы во всю ширину устройства, а не контейнера (в каталоге
// стоит с отрицательным marginHorizontal), поэтому ширину берём из окна, а не
// из процентов родителя. Каталог — закреплённая программа, страница
// программы — шапка.
export function ProgramPreviewCard({
  program,
  bottomOverlap = 0,
  onPress,
  footer,
}: ProgramPreviewCardProps) {
  const { width } = useWindowDimensions();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.wrap, { width }]}
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

      <View
        style={[styles.content, { paddingBottom: spacing.lg + bottomOverlap }]}
      >
        <Typography variant="display" numberOfLines={2}>
          {program.title}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          numberOfLines={2}
        >
          {formatProgramSubtitle(program)}
        </Typography>

        {footer !== undefined ? (
          <View style={styles.footer}>{footer}</View>
        ) : (
          <ProgramReactions program={program} style={styles.footer} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 450,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.Surface.primary,
    overflow: 'hidden',
  },
  fallback: { backgroundColor: COLORS.Surface.secondary },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  footer: { marginTop: spacing.sm, alignItems: 'flex-start' },
});
