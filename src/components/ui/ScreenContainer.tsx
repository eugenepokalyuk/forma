import * as React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.container} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[styles.fill, { paddingHorizontal }]}
          contentContainerStyle={contentStyle}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.Text.secondary}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
