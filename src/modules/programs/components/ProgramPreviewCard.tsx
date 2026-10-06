import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

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
  // Прокрутка списка, в шапке которого стоит обложка, — для параллакса.
  scrollY?: SharedValue<number>;
  // Высота затемнения сверху под статус-бар и шапку. Живёт в слое фото и
  // едет вместе с ним — отдельный градиент поверх обложки при параллаксе
  // «проезжал» бы по фото тёмной полосой.
  topShadeHeight?: number;
  // Высота обложки; по умолчанию — PREVIEW_HEIGHT (шапка страницы программы).
  height?: number;
}

export const PREVIEW_HEIGHT = 450;

// Обложка программы во всю ширину устройства, а не контейнера (в каталоге
// стоит с отрицательным marginHorizontal), поэтому ширину берём из окна, а не
// из процентов родителя. Каталог — закреплённая программа (под шапкой,
// пониже), страница программы — шапка под статус-баром.
export function ProgramPreviewCard({
  program,
  bottomOverlap = 0,
  onPress,
  footer,
  scrollY,
  topShadeHeight,
  height = PREVIEW_HEIGHT,
}: ProgramPreviewCardProps) {
  const { width } = useWindowDimensions();

  // Параллакс: при прокрутке фото уезжает вдвое медленнее контента, при
  // оттягивании вниз рамка фото растёт вверх и фото растягивается вместе с
  // ней, а текст на обложке гаснет, пока уходит под статус-бар.
  const frameStyle = useAnimatedStyle(() => {
    const y = scrollY?.get() ?? 0;
    return { top: Math.min(y, 0) };
  });
  const imageStyle = useAnimatedStyle(() => {
    const y = scrollY?.get() ?? 0;
    return { transform: [{ translateY: Math.max(y, 0) * 0.5 }] };
  });
  const contentStyle = useAnimatedStyle(() => {
    const y = scrollY?.get() ?? 0;
    return {
      opacity: interpolate(y, [0, height * 0.6], [1, 0], Extrapolation.CLAMP),
    };
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.wrap, { width, height }]}
    >
      <Animated.View style={[styles.frame, frameStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
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

          {topShadeHeight ? (
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0)']}
              style={[styles.topShade, { height: topShadeHeight }]}
            />
          ) : null}
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          { paddingBottom: spacing.lg + bottomOverlap },
          contentStyle,
        ]}
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
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Без overflow: hidden — растянутое фото выходит за верх карточки;
  // обрезает его рамка frame.
  wrap: {
    justifyContent: 'flex-end',
    backgroundColor: COLORS.Surface.primary,
  },
  frame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  fallback: { backgroundColor: COLORS.Surface.secondary },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  footer: { marginTop: spacing.sm, alignItems: 'flex-start' },
});
