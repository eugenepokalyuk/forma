import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, spacing } from '@/theme';

import { Button } from '../buttons/Button';
import { Typography } from '../text/Typography';
import { ErrorState } from './ErrorState';

interface EmptyStateProps {
  /** Крупный заголовок («Пока пусто»); без него — только текст. */
  title?: string;
  message: string;
  action?: { title: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}

// Данных нет, и это не ошибка: что здесь появится и, если есть, что сделать.
export function EmptyState({ title, message, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {title ? (
        <Typography variant="display" align="center">
          {title}
        </Typography>
      ) : null}

      <Typography variant="body" color={COLORS.Text.secondary} align="center">
        {message}
      </Typography>

      {action ? (
        <Button
          title={action.title}
          onPress={action.onPress}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

interface ListEmptyProps extends EmptyStateProps {
  isError: boolean;
  isLoading?: boolean;
  onRetry: () => unknown;
}

// ListEmptyComponent списка с данными с сервера: ошибка — повтор, пока
// грузится — ничего (крутилку показывает экран), иначе — EmptyState.
export function ListEmpty({
  isError,
  isLoading,
  onRetry,
  ...empty
}: ListEmptyProps) {
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (isLoading) return null;
  return <EmptyState {...empty} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.xl,
  },
  action: { marginTop: spacing.md },
});
