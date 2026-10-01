import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';
import { COLORS, radius, spacing } from '@/theme';

interface StatTileProps {
  icon: IconName;
  value: string;
  label: string;
  tint?: string;
}

// Плитка «бенто» для дашборда — иконка в цветном кружке + крупное число.
// Используем везде, где нужно показать одну метрику коротко и заметно.
export function StatTile({
  icon,
  value,
  label,
  tint = COLORS.Text.accent,
}: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={[styles.iconDot, { backgroundColor: `${tint}1F` }]}>
        <Icon name={icon} size={32} color={tint} />
      </View>

      <Typography variant="title">{value}</Typography>

      <Typography variant="body" color={COLORS.Text.secondary}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    padding: spacing.md,
    gap: 2,
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
