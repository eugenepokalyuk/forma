import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, motion, radius, spacing } from '@/theme';

import { GlassFill } from '../glass/GlassFill';
import { GLASS_IDLE_BORDER, GlassView } from '../glass/glass';

interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Стиль применяется к обёртке (View), а не к самому TextInput. */
  style?: StyleProp<ViewStyle>;
  /** Значение неверное — красная рамка вместо текста ошибки. */
  error?: boolean;
  /** Меняется — поле трясётся (каждая неудачная попытка, как в iOS). */
  shakeKey?: number;
}

// Тряска «нет»: затухающие качания влево-вправо, ~0,3 с.
const SHAKE_OFFSETS = [-10, 10, -7, 7, -4, 4, 0];
const SHAKE_STEP_MS = 40;

// Высота поля и толщина рамки. Рамка — отдельный слой поверх поля, а не
// border обёртки: на iOS border рисуется под содержимым, и стекло, которое
// занимает поле целиком (как у кнопки), закрыло бы жёлтую рамку фокуса.
const BORDER = 1.5;
const HEIGHT = 48;
const HEIGHT_MULTILINE = 88;

// Единый стиль поля ввода — та же скала радиусов/цветов, что у Button, с
// мягкой подсветкой границы в фокусе. На iOS 26+ — Liquid Glass без заливки
// под ним (как у Button и GlassCard), иначе — обычная заливка. Используем
// везде, где нужен TextInput.
// Нажимается вся рамка: поле растянуто на неё, а тап по бордеру тоже
// ставит фокус — не нужно целиться в текст или плейсхолдер.
export function Input({
  style,
  onFocus,
  onBlur,
  multiline,
  error,
  shakeKey,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  React.useEffect(() => {
    if (!shakeKey) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shakeX.set(
      withSequence(
        ...SHAKE_OFFSETS.map((x) => withTiming(x, { duration: SHAKE_STEP_MS })),
      ),
    );
  }, [shakeKey, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.get() }],
  }));

  return (
    <Animated.View style={shakeStyle}>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false}>
        <View
          style={[
            {
              minHeight: multiline ? HEIGHT_MULTILINE : HEIGHT,
              borderRadius: radius.pill,
              backgroundColor: GlassView
                ? 'transparent'
                : COLORS.Surface.primary,
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
                minHeight: multiline ? HEIGHT_MULTILINE : HEIGHT,
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

          <MotiView
            pointerEvents="none"
            animate={{
              borderColor: error
                ? COLORS.Stroke.error
                : focused
                  ? COLORS.Stroke.accent
                  : GlassView
                    ? GLASS_IDLE_BORDER
                    : COLORS.Stroke.primary,
            }}
            transition={{ type: 'timing', duration: motion.fast }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: radius.pill, borderWidth: BORDER },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}
