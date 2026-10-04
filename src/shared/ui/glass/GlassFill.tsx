import { StyleSheet } from 'react-native';

import { GLASS_NEUTRAL_TINT, GlassView } from './glass';

// Стеклянная подложка поля ввода — на весь родитель, под содержимым, с
// нейтральным оттенком (как у кнопок без цвета). Без Liquid Glass не
// рисуется — поле оставляет свою заливку.

interface GlassFillProps {
  borderRadius: number;
  interactive?: boolean;
}

export function GlassFill({
  borderRadius,
  interactive = true,
}: GlassFillProps) {
  if (!GlassView) return null;

  return (
    <GlassView
      glassEffectStyle="regular"
      tintColor={GLASS_NEUTRAL_TINT}
      isInteractive={interactive}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius }]}
    />
  );
}
