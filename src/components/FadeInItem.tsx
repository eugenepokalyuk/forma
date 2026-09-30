import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { motion } from '@/theme';

// Лёгкий staggered fade+slide для карточек списков — как в современных
// нативных приложениях, без ощутимой задержки восприятия.
export function FadeInItem({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...motion.springSoft, delay: Math.min(index, 8) * 45 }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
