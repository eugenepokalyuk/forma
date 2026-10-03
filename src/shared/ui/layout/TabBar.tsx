import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { CustomIcon, type CustomIconName } from '../text/CustomIcon';
import { Icon, TAB_ICONS } from '../text/Icon';
import {
  COLORS,
  motion,
  radius,
  screenPadding,
  shadow,
  spacing,
} from '@/theme';

// Для части вкладок дизайнер подготовил собственные иконки (см.
// assets/icons) — используем их вместо Material Community Icons там, где
// они есть; для остальных вкладок остаётся набор из TAB_ICONS.
const CUSTOM_TAB_ICON: Record<string, CustomIconName> = {
  catalog: 'programs',
  profile: 'about',
};

// Раскладка: «Лента» и «Каталог» — самостоятельные плавающие кружки по
// краям, «Главная» и «Профиль» — общая пилюля по центру (как в макете).
// Названия вкладок для скринридера — на экране подписей нет, только иконки.
const TAB_LABELS: Record<string, string> = {
  feed: 'Лента',
  home: 'Главная',
  catalog: 'Каталог',
  profile: 'Профиль',
};

const LEFT_ROUTE = 'feed';
const RIGHT_ROUTE = 'catalog';
const CENTER_ROUTES = ['home', 'profile'];

// Локальный минимальный тип вместо импорта из внутреннего пути
// expo-router/react-navigation — нам нужны только эти поля.
interface RouteItem {
  key: string;
  name: string;
}
interface TabBarProps {
  state: { index: number; routes: RouteItem[] };
  // any: реальный тип (react-navigation NavigationHelpers) типизирован по
  // конкретному EventMap без публичного пути импорта из expo-router —
  // используем только emit()/navigate() по их фактическому поведению.
  navigation: any;
}

// Высота самого высокого элемента таб-бара (кружок/пилюля) — используется
// экранами, чтобы их контент не уезжал под плавающий таб-бар (см.
// useTabBarClearance ниже).
export const TAB_BAR_PILL_HEIGHT = 52;

export function useTabBarClearance() {
  const insets = SafeArea.useSafeAreaInsets();
  return (
    TAB_BAR_PILL_HEIGHT +
    spacing.sm +
    Math.max(insets.bottom, spacing.md) +
    spacing.md
  );
}

// Общий «остров» — фон/бордер/тень одинаковые что у кружка с одной
// вкладкой, что у пилюли с двумя: разница только в содержимом.
function TabIsland({ children }: { children: ReactNode }) {
  return <MotiView style={styles.island}>{children}</MotiView>;
}

function TabButton({
  route,
  index,
  state,
  navigation,
}: {
  route: RouteItem;
  index: number;
  state: TabBarProps['state'];
  navigation: TabBarProps['navigation'];
}) {
  const isFocused = state.index === index;
  const icons = TAB_ICONS[route.name];
  const customIcon = CUSTOM_TAB_ICON[route.name];

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      void Haptics.selectionAsync();
      navigation.navigate(route.name);
    }
  };

  // Никакой заливки кнопки при выделении — меняется только сама иконка:
  // контур (stroke) в неактивном состоянии, закрашенная (filled) и
  // акцентного цвета — в активном. Фон «острова» не трогаем.
  const tintColor = isFocused ? COLORS.Icon.accent : COLORS.Icon.tabInactive;

  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityLabel={TAB_LABELS[route.name] ?? route.name}
      accessibilityState={{ selected: isFocused }}
    >
      <MotiView
        animate={{ scale: isFocused ? 1.06 : 1 }}
        transition={motion.springy}
        style={styles.iconBubble}
      >
        {customIcon ? (
          <CustomIcon name={customIcon} size={32} color={tintColor} />
        ) : (
          <Icon
            name={
              icons
                ? isFocused
                  ? icons.filled
                  : icons.outline
                : 'circle-outline'
            }
            size={32}
            color={tintColor}
          />
        )}
      </MotiView>
    </Pressable>
  );
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = SafeArea.useSafeAreaInsets();

  const byName = (name: string) => {
    const index = state.routes.findIndex((r) => r.name === name);
    return index === -1 ? null : { route: state.routes[index], index };
  };

  const left = byName(LEFT_ROUTE);
  const right = byName(RIGHT_ROUTE);
  const centerEntries = CENTER_ROUTES.map(byName).filter(
    (e): e is { route: RouteItem; index: number } => e !== null,
  );

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.row}>
        {left ? (
          <MotiView
            from={{ opacity: 0, translateY: 32, scale: 0.92 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={motion.springSoft}
          >
            <TabIsland>
              <TabButton
                route={left.route}
                index={left.index}
                state={state}
                navigation={navigation}
              />
            </TabIsland>
          </MotiView>
        ) : null}

        <MotiView
          from={{ opacity: 0, translateY: 32, scale: 0.92 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={motion.springSoft}
        >
          <TabIsland>
            {centerEntries.map(({ route, index }) => (
              <TabButton
                key={route.key}
                route={route}
                index={index}
                state={state}
                navigation={navigation}
              />
            ))}
          </TabIsland>
        </MotiView>

        {right ? (
          <MotiView
            from={{ opacity: 0, translateY: 32, scale: 0.92 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={motion.springSoft}
          >
            <TabIsland>
              <TabButton
                route={right.route}
                index={right.index}
                state={state}
                navigation={navigation}
              />
            </TabIsland>
          </MotiView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    zIndex: 100,
    elevation: 100,
  },
  // Три «острова» сгруппированы вместе по центру экрана с фиксированным
  // расстоянием между ними — а не растянуты space-between по краям экрана.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  // Остров: одинаковый паддинг со всех сторон вокруг иконки(ок) — при одной
  // вкладке выходит ровный круг, при двух — пилюля того же визуального языка.
  island: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: COLORS.Background.elevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: COLORS.Stroke.primary,
    padding: spacing.xs,
    ...shadow.floating,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
