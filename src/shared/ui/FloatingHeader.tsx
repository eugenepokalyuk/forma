import type { ReactNode } from 'react';
import {
  StyleSheet,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { COLORS } from '@/theme';

interface FloatingHeaderProps {
  children: ReactNode;
  /** contentOffset.y списка под шапкой — для проявления фона. */
  scrollY: SharedValue<number>;
  /** Отрезок прокрутки, на котором фон проявляется от 0 до 1. */
  revealRange: [number, number];
  style?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
}

// Шапка поверх списка (экраны с обложкой под статус-баром): стоит на месте
// при любой прокрутке и оттягивании. Пока под ней обложка — прозрачная,
// когда обложка уехала — проявляется фон, и контент уходит под него.
export function FloatingHeader({
  children,
  scrollY,
  revealRange,
  style,
  onLayout,
}: FloatingHeaderProps) {
  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      revealRange,
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      onLayout={onLayout}
      pointerEvents="box-none"
      style={[styles.layer, style]}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}
      />

      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  backdrop: { backgroundColor: COLORS.Background.primary },
});
