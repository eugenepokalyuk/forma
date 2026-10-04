import { StyleSheet } from 'react-native';

import { GlassView } from './glass';

// Стеклянная подложка поля ввода — на весь родитель, под содержимым.
// Лёгкий светлый оттенок нужен, когда поле лежит на другом стекле
// (GlassCard, шторка): стекло не преломляет стекло, и без оттенка поле
// сливается с карточкой. Без Liquid Glass не рисуется — поле оставляет
// свою заливку.
export const FIELD_GLASS_TINT = 'rgba(255, 255, 255, 0.08)';

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
      tintColor={FIELD_GLASS_TINT}
      isInteractive={interactive}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius }]}
    />
  );
}
