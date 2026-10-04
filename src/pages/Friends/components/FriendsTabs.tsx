import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

export type FriendsTab = 'following' | 'followers' | 'requests';

const TABS: { key: FriendsTab; label: string }[] = [
  { key: 'following', label: 'Подписки' },
  { key: 'followers', label: 'Подписчики' },
  { key: 'requests', label: 'Запросы' },
];

// Вкладки под поиском: активная — светлая, с жёлтой чертой снизу.
export function FriendsTabs({
  tab,
  onChange,
}: {
  tab: FriendsTab;
  onChange: (tab: FriendsTab) => void;
}) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tab}
          >
            <Typography
              variant="subtitle"
              color={active ? COLORS.Text.primary : COLORS.Text.tertiary}
            >
              {t.label}
            </Typography>

            {active ? <View style={styles.underline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.Stroke.hairline,
  },
  tab: { paddingBottom: spacing.sm, alignItems: 'center', gap: spacing.xs },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.Text.accent,
    borderRadius: 1,
  },
});
