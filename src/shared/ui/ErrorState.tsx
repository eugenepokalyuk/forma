import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS, spacing } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { Typography } from './Typography';

interface ErrorStateProps {
  onRetry: () => unknown;
  title?: string;
  message?: string;
}

// Данные не загрузились, а показать из кэша нечего: вместо пустого экрана
// или «пока пусто» — честное сообщение и повтор.
export function ErrorState({
  onRetry,
  title = 'Не удалось загрузить',
  message = 'Проверьте подключение к интернету и попробуйте ещё раз',
}: ErrorStateProps) {
  const [retrying, setRetrying] = React.useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Icon name="wifi-off" size={36} color={COLORS.Icon.secondary} />

      <Typography variant="heading" align="center">
        {title}
      </Typography>

      <Typography variant="body" color={COLORS.Text.secondary} align="center">
        {message}
      </Typography>

      <Button
        title="Повторить"
        variant="secondary"
        loading={retrying}
        onPress={() => void retry()}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  button: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
