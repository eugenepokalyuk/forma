import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Typography } from './Typography';
import { spacing } from '@/theme';

interface SectionProps {
  title?: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Блок контента на всю ширину контейнера — без своего горизонтального
// паддинга (его задаёт ScreenContainer), с единым отступом снизу между
// секциями экрана. Каждый самостоятельный блок экрана — своя Section.
export function Section({ title, action, children, style }: SectionProps) {
  return (
    <View style={[styles.container, style]}>
      {title ? (
        <View style={styles.header}>
          <Typography variant="display" style={styles.title}>
            {title}
          </Typography>
        </View>
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { flexShrink: 1 },
});
