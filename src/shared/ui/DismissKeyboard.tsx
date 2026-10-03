import type { ReactNode } from 'react';
import {
  Keyboard,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface DismissKeyboardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Тап по пустому месту прячет клавиатуру. Поля, кнопки и списки внутри
// обрабатывают касания сами — сюда доходят только «мимо».
export function DismissKeyboard({ children, style }: DismissKeyboardProps) {
  return (
    <Pressable style={style} onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </Pressable>
  );
}
