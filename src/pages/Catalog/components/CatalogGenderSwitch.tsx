import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import type { CatalogGender } from '@/modules/programs';
import { Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

const OPTIONS: { key: CatalogGender; label: string }[] = [
  { key: 'men', label: 'Мужская' },
  { key: 'women', label: 'Женская' },
];

// Переключатель вкладок каталога «Мужская» / «Женская» под шапкой:
// выбранная половина — жёлтая.
export function CatalogGenderSwitch({
  value,
  onChange,
}: {
  value: CatalogGender;
  onChange: (value: CatalogGender) => void;
}) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
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
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Typography
              variant="subtitle"
              color={active ? COLORS.Text.inverse : COLORS.Text.secondary}
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
  track: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.secondary,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: COLORS.Surface.accent,
  },
});
