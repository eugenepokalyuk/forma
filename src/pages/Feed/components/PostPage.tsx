import type { ReactNode } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

// Соседние посты меньше и приглушены — центральный «выезжает» вперёд.
const SCALE: [number, number, number] = [0.9, 1, 0.9];
const OPACITY: [number, number, number] = [0.5, 1, 0.5];

interface PostPageProps {
  index: number;
  /** Шаг прокрутки между постами (высота поста + зазор). */
  interval: number;
  height: number;
  scrollY: SharedValue<number>;
  children: ReactNode;
}

// Страница вертикальной карусели ленты: масштаб и прозрачность — от того,
// насколько пост далёк от центра.
export function PostPage({
  index,
  interval,
  height,
  scrollY,
  children,
}: PostPageProps) {
  const style = useAnimatedStyle(() => {
    const distance = scrollY.get() / interval - index;
    return {
      opacity: interpolate(distance, [-1, 0, 1], OPACITY, Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(distance, [-1, 0, 1], SCALE, Extrapolation.CLAMP),
        },
      ],
    };
  });

  return <Animated.View style={[{ height }, style]}>{children}</Animated.View>;
}
