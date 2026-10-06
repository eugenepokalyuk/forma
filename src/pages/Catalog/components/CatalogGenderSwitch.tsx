import * as Haptics from 'expo-haptics';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { CatalogGender } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

const OPTIONS: { key: CatalogGender; label: string }[] = [
  { key: 'men', label: 'Мужская' },
  { key: 'women', label: 'Женская' },
];

// Вкладки каталога «Мужская» / «Женская» под шапкой: каждая на половину
// ширины, под выбранной — светлая черта, под второй — тёмная.
export function CatalogGenderSwitch({
  value,
  onChange,
  style,
}: {
  value: CatalogGender;
  onChange: (value: CatalogGender) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.tabs, style]} accessibilityRole="tablist">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              if (active) return;
              void Haptics.selectionAsync();
              onChange(o.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Typography
              variant="title"
              color={active ? COLORS.Text.primary : COLORS.Text.secondary}
            >
              {o.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.Stroke.secondary,
  },
  tabActive: {
    borderBottomColor: COLORS.Text.primary,
  },
});
