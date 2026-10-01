import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';
import { COLORS, radius, spacing } from '@/theme';

interface ListRowProps {
  icon: IconName;
  tint?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

// Строка сгруппированного списка (как iOS Settings) — набор ListRow внутри
// одной поверхности с разделителями образует одну логическую группу.
export function ListRow({
  icon,
  tint,
  title,
  subtitle,
  trailing,
  onPress,
  destructive,
  showChevron = !!onPress,
  isFirst,
  isLast,
}: ListRowProps) {
  const iconTint =
    tint ?? (destructive ? COLORS.Text.negative : COLORS.Text.accent);
  const titleColor = destructive ? COLORS.Text.negative : COLORS.Text.primary;

  const content = (
    <View
      style={[
        styles.row,
        !isFirst && styles.divider,
        isFirst && styles.first,
        isLast && styles.last,
      ]}
    >
      <View style={[styles.iconDot, { backgroundColor: `${iconTint}1F` }]}>
        <Icon name={icon} size={32} color={iconTint} />
      </View>

      <View style={styles.textCol}>
        <Typography variant="subtitle" color={titleColor}>
          {title}
        </Typography>

        {subtitle ? (
          <Typography variant="body" color={COLORS.Text.tertiary}>
            {subtitle}
          </Typography>
        ) : null}
      </View>

      {trailing}

      {showChevron ? (
        <Icon name="chevron-right" size={18} color={COLORS.Icon.tertiary} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: COLORS.Stroke.secondary }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  first: { paddingTop: spacing.md },
  last: { paddingBottom: spacing.md },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.Stroke.hairline,
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 1 },
  group: {
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    overflow: 'hidden',
  },
});

interface ListGroupProps {
  children: ReactNode;
}

// Обёртка-карточка для набора ListRow — единая поверхность со сквозным
// скруглением, разделители рисуют сами строки.
export function ListGroup({ children }: ListGroupProps) {
  return <View style={styles.group}>{children}</View>;
}
