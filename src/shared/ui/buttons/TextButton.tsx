import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, spacing } from '@/theme';

import { Typography } from '../text/Typography';

const TONE_COLOR = {
  accent: COLORS.Text.accent,
  secondary: COLORS.Text.secondary,
} as const;

interface TextButtonProps {
  title: string;
  onPress: () => void;
  /** accent — действие («Отправить ещё раз»), secondary — запасной путь. */
  tone?: keyof typeof TONE_COLOR;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Кнопка-ссылка без подложки: второстепенные действия под формой и в
// карточках. Зона касания шире текста — hitSlop.
export function TextButton({
  title,
  onPress,
  tone = 'secondary',
  disabled,
  style,
}: TextButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={spacing.sm}
      style={style}
    >
      <Typography
        variant="subtitle"
        color={disabled ? COLORS.Text.tertiary : TONE_COLOR[tone]}
        align="center"
      >
        {title}
      </Typography>
    </Pressable>
  );
}
