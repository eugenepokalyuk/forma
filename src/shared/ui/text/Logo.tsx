import Svg, { Rect } from 'react-native-svg';

import { COLORS } from '@/theme';

interface LogoProps {
  size?: number;
  color?: string;
}

// Фирменный знак — три полосы разной длины (см. assets/branding/logo.svg,
// экспорт из макета Figma), перерисован как react-native-svg-компонент:
// векторный, красится в любой акцентный цвет без растровых ассетов.
export function Logo({ size = 32, color = COLORS.Surface.accent }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x={1} y={22} width={8} height={8} rx={4} fill={color} />
      <Rect x={7} y={2} width={24} height={8} rx={4} fill={color} />
      <Rect x={4} y={12} width={16} height={8} rx={4} fill={color} />
    </Svg>
  );
}
