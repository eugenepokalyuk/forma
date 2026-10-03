import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { screenPadding, spacing } from '@/theme';

import { Typography } from '../text/Typography';

interface SectionProps extends React.PropsWithChildren {
  title?: string;
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Блок контента на всю ширину контейнера — без своего горизонтального
// паддинга (его задаёт ScreenContainer), с единым отступом снизу между
// секциями экрана. Каждый самостоятельный блок экрана — своя Section
export function Section({ title, padding, style, children }: SectionProps) {
  return (
    <View
      style={[
        styles.container,
        padding && { paddingHorizontal: screenPadding },
        style,
      ]}
    >
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
