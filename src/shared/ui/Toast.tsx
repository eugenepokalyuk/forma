import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from 'react-native-reanimated';
import * as SafeArea from 'react-native-safe-area-context';
import { create } from 'zustand';

import { COLORS, radius, shadow, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type ToastType = 'info' | 'success' | 'error' | 'pending';

export interface ToastOptions {
  /** Тост с тем же id обновляется на месте, а не дублируется. */
  id?: string;
  type?: ToastType;
  title: string;
  /** Мс до скрытия; null — висит, пока не скроют через toast.dismiss. */
  duration?: number | null;
}

interface ToastItem extends Required<Omit<ToastOptions, 'duration'>> {
  duration: number | null;
}

interface ToastState {
  items: ToastItem[];
  show: (item: ToastItem) => void;
  dismiss: (id: string) => void;
}

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 3000;

const useToastStore = create<ToastState>((set) => ({
  items: [],
  show: (item) =>
    set((s) => {
      const exists = s.items.some((t) => t.id === item.id);
      const items = exists
        ? s.items.map((t) => (t.id === item.id ? item : t))
        : [...s.items, item];
      return { items: items.slice(-MAX_VISIBLE) };
    }),
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

let seq = 0;

// Глобальный API: тосты поверх экрана, ничего не сдвигают в раскладке.
export const toast = {
  show({ id, type = 'info', title, duration }: ToastOptions) {
    const item: ToastItem = {
      id: id ?? `toast-${++seq}`,
      type,
      title,
      duration:
        duration === undefined
          ? type === 'pending'
            ? null
            : DEFAULT_DURATION
          : duration,
    };
    useToastStore.getState().show(item);
    return item.id;
  },
  dismiss(id: string) {
    useToastStore.getState().dismiss(id);
  },
};

const ICONS: Record<ToastType, { name: IconName; color: string }> = {
  info: { name: 'information-outline', color: COLORS.Icon.secondary },
  success: { name: 'check-circle-outline', color: COLORS.Icon.positive },
  error: { name: 'alert-circle-outline', color: COLORS.Text.negative },
  pending: { name: 'cloud-sync-outline', color: COLORS.Icon.accent },
};

function ToastView({ item }: { item: ToastItem }) {
  const { id, duration, type, title } = item;

  // Таймер перезапускается, когда тост обновили (тот же id, новый текст).
  React.useEffect(() => {
    if (duration === null) return;
    const t = setTimeout(() => toast.dismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, title]);

  const icon = ICONS[type];

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition.springify().damping(18)}
    >
      <Pressable
        onPress={() => toast.dismiss(id)}
        accessibilityRole="alert"
        accessibilityHint="Нажмите, чтобы скрыть"
        style={styles.toast}
      >
        <Icon name={icon.name} size={20} color={icon.color} />

        <Typography variant="label" style={styles.title} numberOfLines={2}>
          {title}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

// Слой тостов — один на приложение, монтируется в корневом layout.
export function Toaster() {
  const insets = SafeArea.useSafeAreaInsets();
  const items = useToastStore((s) => s.items);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.layer, { top: insets.top + spacing.xs }]}
    >
      {items.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 420,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: COLORS.Stroke.secondary,
    backgroundColor: COLORS.Surface.secondary,
    ...shadow.floating,
  },
  title: { flexShrink: 1 },
});
