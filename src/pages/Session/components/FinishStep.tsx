import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { DismissKeyboard, FadeInCover, Icon, Typography } from '@/shared/ui';
import { COLORS, hitTarget, screenPadding, spacing } from '@/theme';

interface FinishStepProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
  /** Кнопки внизу экрана. */
  actions: ReactNode;
}

// Каркас шагов после итога (оценка, публикация): «назад», заголовок,
// содержимое по центру и кнопки внизу.
export function FinishStep({
  title,
  subtitle,
  onBack,
  children,
  actions,
}: FinishStepProps) {
  const insets = SafeArea.useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DismissKeyboard
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xs,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Pressable
          onPress={onBack}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          style={styles.back}
        >
          <Icon name="chevron-left" size={32} />
        </Pressable>

        <View style={styles.header}>
          <Typography variant="display" align="center">
            {title}
          </Typography>

          <Typography
            variant="body"
            color={COLORS.Text.secondary}
            align="center"
          >
            {subtitle}
          </Typography>
        </View>

        {/* Прокрутка — когда не влезает (фото на всю ширину + клавиатура). */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.actions}>{actions}</View>

        <FadeInCover />
      </DismissKeyboard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  content: { flex: 1, paddingHorizontal: screenPadding, gap: spacing.lg },
  back: {
    width: hitTarget,
    height: hitTarget,
    marginLeft: -spacing.sm,
    justifyContent: 'center',
  },
  header: { gap: spacing.xs },
  body: { flex: 1 },
  bodyContent: { flexGrow: 1, justifyContent: 'center' },
  actions: { gap: spacing.sm },
});
