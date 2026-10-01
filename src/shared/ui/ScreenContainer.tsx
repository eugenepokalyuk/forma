import * as React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';

import { COLORS, screenPadding } from '@/theme';

interface ScreenContainerProps extends React.PropsWithChildren {
  scroll?: boolean;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  edges?: Edge[];
  withPadding?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

// Прокрутка «под статус-бар», как в нативных iOS-приложениях: в исходном
// положении контент начинается ниже статус-бара, а при прокрутке уходит под
// него. На iOS — через contentInset (тогда и индикатор pull-to-refresh
// появляется ниже статус-бара), на Android contentInset нет — отступ в
// контенте и сдвиг индикатора.
export function useUnderStatusBarScroll() {
  const { top } = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    const scrollProps: ScrollViewProps = {
      contentInset: { top },
      contentOffset: { x: 0, y: -top },
      scrollIndicatorInsets: { top },
      contentInsetAdjustmentBehavior: 'never',
      automaticallyAdjustContentInsets: false,
    };
    return { scrollProps, paddingTop: 0, refreshOffset: 0 };
  }

  return {
    scrollProps: {} as ScrollViewProps,
    paddingTop: top,
    refreshOffset: top,
  };
}

// Градиент под статус-баром: время и батарея читаются поверх уехавшего
// под них контента.
function StatusBarScrim() {
  const { top } = useSafeAreaInsets();
  const bg = COLORS.Background.primary;

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[bg, `${bg}00`]}
      style={[styles.scrim, { height: top + 12 }]}
    />
  );
}

// Общий каркас экрана: safe area, единый горизонтальный паддинг, лоадер на
// пустом кэше, pull-to-refresh — чтобы не повторять это в каждом экране.
export function ScreenContainer({
  children,
  scroll = false,
  loading = false,
  onRefresh,
  refreshing = false,
  edges = ['top', 'bottom'],
  withPadding = true,
  contentStyle,
}: ScreenContainerProps) {
  // Верхний край — не отступ контейнера, а место под статус-баром, куда
  // уезжает контент (см. useUnderStatusBarScroll). Экраны со своими списками
  // (scroll={false}) подключают useUnderStatusBarScroll сами.
  const underStatusBar = edges.includes('top');
  const safeEdges = underStatusBar ? edges.filter((e) => e !== 'top') : edges;
  const statusBarScroll = useUnderStatusBarScroll();
  const scrollInset = underStatusBar
    ? statusBarScroll
    : { scrollProps: {}, paddingTop: 0, refreshOffset: 0 };

  const paddingHorizontal = withPadding ? screenPadding : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={edges}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.Icon.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={safeEdges}>
      {scroll ? (
        <ScrollView
          {...scrollInset.scrollProps}
          showsVerticalScrollIndicator={false}
          style={[styles.fill, { paddingHorizontal }]}
          contentContainerStyle={[
            { paddingTop: scrollInset.paddingTop },
            contentStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.Text.secondary}
                progressViewOffset={scrollInset.refreshOffset}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, { paddingHorizontal }, contentStyle]}>
          {children}
        </View>
      )}

      {underStatusBar ? <StatusBarScrim /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
