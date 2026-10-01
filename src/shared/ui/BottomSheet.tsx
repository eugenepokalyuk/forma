import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { COLORS, radius, spacing } from '@/theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  // Для шторок со списком: шторка не выше части экрана, список скроллится.
  maxHeight?: ViewStyle['maxHeight'];
  style?: StyleProp<ViewStyle>;
}

// Шторка снизу — единый вид для всех: затемнение, заголовок с крестиком,
// закрытие тапом по фону и системной «назад». Поднимается над клавиатурой
// и не залезает под home indicator.
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  maxHeight,
  style,
}: BottomSheetProps) {
  const insets = SafeArea.useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Фон — отдельный слой на весь экран, а не сосед шторки по flex:
          иначе он «прилипает» к её высоте и ездит при открытии клавиатуры. */}
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md },
            maxHeight != null && { maxHeight },
            style,
          ]}
        >
          <View style={styles.header}>
            <Typography variant="heading">{title}</Typography>

            <Pressable onPress={onClose} hitSlop={12}>
              <Icon name="close" size={20} color={COLORS.Icon.secondary} />
            </Pressable>
          </View>

          {children}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.Overlay.backdrop,
  },
  sheet: {
    backgroundColor: COLORS.Background.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
