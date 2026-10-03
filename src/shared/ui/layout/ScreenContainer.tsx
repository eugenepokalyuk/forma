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

import { COLORS } from '@/theme';

interface ScreenContainerProps extends React.PropsWithChildren {
  scroll?: boolean;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  // Градиент цвета фона под статус-баром. Выключают экраны, у которых
  // сверху во всю высоту картинка — там свой тёмный градиент.
  statusBarScrim?: boolean;
  // Шапка над прокруткой — закреплена, как в ленте: не уезжает ни при
  // прокрутке, ни при оттягивании; контент прокручивается под ней.
  header?: React.ReactNode;
}

// Прокрутка «под статус-бар», как в нативных iOS-приложениях: в исходном
// положении контент начинается ниже статус-бара (отступ внутри контента), а
// при прокрутке уходит под него. Индикатор pull-to-refresh сдвигается ниже
// статус-бара (progressViewOffset работает на iOS и Android). contentInset +
// начальный contentOffset не используем: на новой архитектуре начальное
// смещение не применялось, и контент стартовал под статус-баром.
export function useUnderStatusBarScroll() {
  const { top } = useSafeAreaInsets();
  const scrollProps: ScrollViewProps =
    Platform.OS === 'ios' ? { scrollIndicatorInsets: { top } } : {};

  return { scrollProps, paddingTop: top, refreshOffset: top };
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
  contentStyle,
  statusBarScrim = true,
  header,
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

  // С закреплённой шапкой отступ под статус-бар — у неё, а не у контента.
  const pinnedHeader = header !== undefined;
  const contentInset =
    pinnedHeader && underStatusBar
      ? { scrollProps: {}, paddingTop: 0, refreshOffset: 0 }
      : scrollInset;

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
      {pinnedHeader ? (
        <View style={{ paddingTop: scrollInset.paddingTop }}>{header}</View>
      ) : null}

      {scroll ? (
        <ScrollView
          {...contentInset.scrollProps}
          showsVerticalScrollIndicator={false}
          style={styles.fill}
          contentContainerStyle={[
            { paddingTop: contentInset.paddingTop },
            contentStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.Text.secondary}
                progressViewOffset={contentInset.refreshOffset}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, contentStyle]}>{children}</View>
      )}

      {underStatusBar && statusBarScrim ? <StatusBarScrim /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
  },
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
