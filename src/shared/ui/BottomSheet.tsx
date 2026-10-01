import * as React from 'react';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as SafeArea from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, radius, spacing } from '@/theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

// Открытие: фон затемняется, следом шторка мягко выезжает снизу.
// Закрытие — в обратном порядке: шторка уезжает, затем гаснет фон.
const BACKDROP_IN = { duration: 220, easing: Easing.out(Easing.quad) };
const SHEET_IN_DELAY = 90;
const SHEET_IN = { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) };
const SHEET_OUT = { duration: 260, easing: Easing.bezier(0.4, 0, 1, 1) };
const BACKDROP_OUT = { duration: 200, easing: Easing.in(Easing.quad) };

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

  // Modal остаётся смонтированным, пока идёт анимация закрытия.
  const [mounted, setMounted] = React.useState(visible);
  if (visible && !mounted) setMounted(true);

  const backdrop = useSharedValue(0);
  // Пока высота шторки неизвестна — далеко за нижним краем.
  const translateY = useSharedValue(10_000);
  const sheetHeight = React.useRef(0);
  const pendingOpen = React.useRef(false);

  const slideIn = React.useCallback(() => {
    pendingOpen.current = false;
    translateY.set(withDelay(SHEET_IN_DELAY, withTiming(0, SHEET_IN)));
  }, [translateY]);

  React.useEffect(() => {
    if (visible) {
      backdrop.set(withTiming(1, BACKDROP_IN));
      // Выезжаем, когда известна высота; при повторном открытии она уже есть.
      if (sheetHeight.current > 0) slideIn();
      else pendingOpen.current = true;
      return;
    }
    if (!mounted) return;

    pendingOpen.current = false;
    translateY.set(
      withTiming(sheetHeight.current, SHEET_OUT, (done) => {
        if (!done) return;
        backdrop.set(
          withTiming(0, BACKDROP_OUT, (finished) => {
            if (finished) scheduleOnRN(setMounted, false);
          }),
        );
      }),
    );
  }, [visible, mounted, backdrop, translateY, slideIn]);

  const onSheetLayout = (e: LayoutChangeEvent) => {
    sheetHeight.current = e.nativeEvent.layout.height;
    if (pendingOpen.current) {
      translateY.set(sheetHeight.current);
      slideIn();
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Фон — отдельный слой на весь экран, а не сосед шторки по flex:
            иначе он «прилипает» к её высоте и ездит при открытии клавиатуры. */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
          />
        </Animated.View>

        {/* KeyboardAvoidingView с behavior="padding" подменяет paddingBottom
            своим значением (0 без клавиатуры) — поэтому он только обёртка,
            а отступы шторки живут на вложенном View. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={maxHeight != null && { maxHeight }}
        >
          <Animated.View
            onLayout={onSheetLayout}
            // Фокус VoiceOver не уходит под шторку; жест «назад» закрывает её.
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md,
              },
              style,
              sheetStyle,
            ]}
          >
            <View style={styles.header}>
              <Typography variant="heading">{title}</Typography>

              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Закрыть"
              >
                <Icon name="close" size={20} color={COLORS.Icon.secondary} />
              </Pressable>
            </View>

            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: COLORS.Overlay.backdrop,
  },
  sheet: {
    // Сжимается, когда клавиатура забирает место внутри maxHeight.
    flexShrink: 1,
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
