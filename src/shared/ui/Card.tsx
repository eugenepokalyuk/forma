import { MotiView } from 'moti';
import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { COLORS, motion, radius, shadow, spacing } from '@/theme';

interface CardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Card({ onPress, style, children }: CardProps) {
  const [pressed, setPressed] = React.useState(false);
  const content = (
    <MotiView
      animate={{ scale: pressed ? 0.98 : 1 }}
      transition={motion.springy}
      style={[styles.card, style]}
    >
      {children}
    </MotiView>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    ...shadow.card,
  },
});
