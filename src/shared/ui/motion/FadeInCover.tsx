import { MotiView } from 'moti';
import { StyleSheet } from 'react-native';

import { COLORS, motion } from '@/theme';

// Плавное появление экрана без прозрачности у самого экрана: поверх
// содержимого лежит слой цвета фона и растворяется. На однотонном фоне
// выглядит так же, как fade-in, но Liquid Glass кнопок внутри создаётся при
// полной непрозрачности — иначе iOS молча не рисует стекло (остаётся голая
// надпись). Ставить последним ребёнком, поверх всего.
export function FadeInCover({
  color = COLORS.Background.primary,
}: {
  color?: string;
}) {
  return (
    <MotiView
      pointerEvents="none"
      from={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ type: 'timing', duration: motion.base }}
      style={[StyleSheet.absoluteFill, { backgroundColor: color }]}
    />
  );
}
