import { MotiView } from 'moti';
import * as React from 'react';
import {
  Pressable,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { COLORS, motion, radius, spacing } from '@/theme';

import { GlassFill } from '../glass/GlassFill';
import { GlassView } from '../glass/glass';

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Стиль применяется к обёртке (View), а не к самому TextInput. */
  style?: StyleProp<ViewStyle>;
}

// Высота рамки и бордер — само поле занимает её целиком, без зазоров.
const BORDER = 1.5;
const HEIGHT = 48;
const HEIGHT_MULTILINE = 88;

// Единый стиль поля ввода — та же скала радиусов/цветов, что у Button, с
// мягкой подсветкой границы в фокусе. На iOS 26+ — Liquid Glass без заливки
// под ним (как у Button и GlassCard), иначе — обычная заливка. Используем везде, где нужен TextInput.
// Нажимается вся рамка: поле растянуто на неё, а тап по бордеру тоже
// ставит фокус — не нужно целиться в текст или плейсхолдер.
export function Input({
  style,
  onFocus,
  onBlur,
  multiline,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
      <MotiView
        animate={{
          borderColor: focused ? COLORS.Stroke.accent : COLORS.Stroke.primary,
        }}
        transition={{ type: 'timing', duration: motion.fast }}
        style={[
          {
            minHeight: multiline ? HEIGHT_MULTILINE : HEIGHT,
            borderRadius: radius.pill,
            backgroundColor: GlassView ? 'transparent' : COLORS.Surface.primary,
            borderWidth: BORDER,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <GlassFill borderRadius={radius.pill} />

        <TextInput
          ref={inputRef}
          placeholderTextColor={COLORS.Text.tertiary}
          multiline={multiline}
          style={[
            {
              color: COLORS.Text.primary,
              fontSize: 16,
              // Отступы — у самого поля, а не у рамки: они тоже нажимаются.
              paddingHorizontal: spacing.md,
              paddingVertical: multiline ? spacing.sm : 0,
              minHeight: (multiline ? HEIGHT_MULTILINE : HEIGHT) - BORDER * 2,
            },
            // Многострочное поле растёт по тексту от minHeight до maxHeight
            // обёртки и только потом прокручивается. Не flex: 1 — с ним высота
            // поля не зависит от текста, и всё набранное прокручивалось внутри
            // исходной высоты (в комментариях — одной строки).
            multiline && {
              flexGrow: 1,
              flexShrink: 1,
              textAlignVertical: 'top',
            },
          ]}
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
    </Pressable>
  );
}
