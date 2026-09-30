import { MotiView } from 'moti';
import * as React from 'react';
import {
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { COLORS, motion, radius, spacing } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Стиль применяется к обёртке (View), а не к самому TextInput. */
  style?: StyleProp<ViewStyle>;
}

// Единый стиль поля ввода — та же скала радиусов/цветов, что у Button, с
// мягкой подсветкой границы в фокусе. Используем везде, где нужен TextInput.
export function Input({
  style,
  onFocus,
  onBlur,
  multiline,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <MotiView
      animate={{
        borderColor: focused ? COLORS.Stroke.accent : COLORS.Stroke.primary,
      }}
      transition={{ type: 'timing', duration: motion.fast }}
      style={[
        {
          minHeight: multiline ? 88 : 52,
          borderRadius: radius.md,
          backgroundColor: COLORS.Surface.primary,
          borderWidth: 1.5,
          justifyContent: multiline ? 'flex-start' : 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: multiline ? spacing.sm : 0,
        },
        style,
      ]}
    >
      <TextInput
        placeholderTextColor={COLORS.Text.tertiary}
        multiline={multiline}
        style={{
          color: COLORS.Text.primary,
          fontSize: 16,
          flex: multiline ? 1 : undefined,
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </MotiView>
  );
}
