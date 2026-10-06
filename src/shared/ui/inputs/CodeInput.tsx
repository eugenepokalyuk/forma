import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { COLORS, motion, radius, spacing } from '@/theme';

import { Typography } from '../text/Typography';

interface CodeInputProps {
  value: string;
  /** Только цифры, не длиннее length. */
  onChangeText: (digits: string) => void;
  /** Введены все цифры — удобно отправлять код без кнопки. */
  onComplete?: (digits: string) => void;
  length?: number;
  autoFocus?: boolean;
}

// Код из письма: круглая ячейка на каждую цифру, под ними — скрытое поле, которое
// принимает ввод и автоподстановку кода. Тап по ячейкам открывает клавиатуру.
// Без Liquid Glass и на iOS 26+: шесть мелких стеклянных ячеек подряд
// выглядят шумно — у них обычная заливка, как на Android.
export function CodeInput({
  value,
  onChangeText,
  onComplete,
  length = 6,
  autoFocus,
}: CodeInputProps) {
  const inputRef = React.useRef<TextInput>(null);

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={styles.digits}
      >
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;

          return (
            <MotiView
              key={i}
              from={filled ? { scale: 1.15 } : undefined}
              animate={{
                scale: 1,
                backgroundColor: filled
                  ? COLORS.Surface.secondary
                  : COLORS.Surface.primary,
              }}
              transition={motion.springy}
              style={styles.digitBox}
            >
              <Typography variant="display">{value[i] ?? ''}</Typography>

              {/* Рамка — слоем поверх заливки ячейки. */}
              <MotiView
                pointerEvents="none"
                animate={{
                  borderColor: active
                    ? COLORS.Stroke.accent
                    : filled
                      ? COLORS.Stroke.secondary
                      : COLORS.Stroke.primary,
                }}
                transition={motion.springy}
                style={styles.digitBorder}
              />
            </MotiView>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
      />
    </>
  );
}

const styles = StyleSheet.create({
  digits: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  digitBox: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
});
