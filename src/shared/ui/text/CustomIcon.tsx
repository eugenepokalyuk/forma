import { Image } from 'expo-image';

// Иконки, подготовленные дизайнером (экспорт из Figma, assets/icons/*) —
// для концепций без готового аналога в Material Community Icons.
// Растровые, но однотонные (белые на прозрачном фоне), поэтому красим
// через tintColor вместо того, чтобы держать вариант на каждый цвет.
const ASSETS = {
  about: require('@/assets/icons/about.png'),
  edit: require('@/assets/icons/edit.png'),
  cards: require('@/assets/icons/cards.png'),
  programs: require('@/assets/icons/programs.png'),
  tg: require('@/assets/icons/tg.png'),
} as const;

export type CustomIconName = keyof typeof ASSETS;

interface CustomIconProps {
  name: CustomIconName;
  size?: number;
  color?: string;
}

export function CustomIcon({ name, size = 22, color }: CustomIconProps) {
  return (
    <Image
      source={ASSETS[name]}
      style={{ width: size, height: size }}
      contentFit="contain"
      tintColor={color}
    />
  );
}
