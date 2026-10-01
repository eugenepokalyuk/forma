import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { COLORS, TYPOGRAPHY, type TypographyVariant } from '@/theme';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = COLORS.Text.primary,
  align,
  style,
  children,
  ...textProps
}: TypographyProps) {
  const variantStyle = TYPOGRAPHY[variant];
  return (
    <Text
      allowFontScaling={false}
      style={[
        variantStyle,
        { color },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}
