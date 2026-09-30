import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { COLORS } from '@/theme';

// Google Material (Material Community Icons) — единая точка входа на набор
// иконок, чтобы глифы не расходились по стилю между экранами.
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({
  name,
  size = 22,
  color = COLORS.Icon.primary,
}: IconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

// Пары filled/outline для таб-бара: активная вкладка — залитая иконка,
// неактивная — контурная (как в стандартном iOS Tab Bar).
export const TAB_ICONS: Record<
  string,
  { outline: IconName; filled: IconName }
> = {
  feed: { outline: 'newspaper-variant-outline', filled: 'newspaper-variant' },
  home: { outline: 'home-outline', filled: 'home' },
  profile: { outline: 'account-circle-outline', filled: 'account-circle' },
  catalog: { outline: 'view-grid-outline', filled: 'view-grid' },
};
