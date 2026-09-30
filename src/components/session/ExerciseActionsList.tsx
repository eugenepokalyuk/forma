import * as React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Icon, Typography } from '@/components/ui';
import { COLORS, screenPadding, spacing } from '@/theme';

interface ExerciseActionsListProps {
  tips: string | null;
  noteDraft: string;
  onOpenNote: () => void;
  onSkip: () => void;
  /** То же меню «Тренировка», что открывает «ЗАВЕРШИТЬ» в шапке экрана —
   * переиспользуем вместо повторной реализации. */
  onFinish: () => void;
}

export function ExerciseActionsList({
  tips,
  noteDraft,
  onOpenNote,
  onSkip,
  onFinish,
}: ExerciseActionsListProps) {
  const [tipsOpen, setTipsOpen] = React.useState(false);

  const onSkipPress = () => {
    Alert.alert('Пропустить упражнение?', 'Подходы не будут засчитаны', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Пропустить', style: 'destructive', onPress: onSkip },
    ]);
  };

  const onReplacePress = () => {
    Alert.alert(
      'Скоро',
      'Подбор похожего упражнения появится в одном из следующих обновлений',
    );
  };

  return (
    <View style={styles.list}>
      <ActionRow
        icon="note-plus-outline"
        title="Добавить заметку"
        subtitle={noteDraft || undefined}
        onPress={onOpenNote}
      />

      {tips ? (
        <>
          <ActionRow
            icon="lightbulb-on-outline"
            title="Советы по технике"
            trailingIcon={tipsOpen ? 'chevron-up' : 'chevron-down'}
            onPress={() => setTipsOpen((v) => !v)}
          />

          {tipsOpen ? (
            <Typography
              variant="body"
              color={COLORS.Text.secondary}
              style={styles.tipsText}
            >
              {tips}
            </Typography>
          ) : null}
        </>
      ) : null}

      <ActionRow
        icon="swap-horizontal"
        title="Заменить на похожее упражнение"
        onPress={onReplacePress}
      />
      <ActionRow
        icon="skip-next-outline"
        title="Пропустить упражнение"
        onPress={onSkipPress}
      />
      <ActionRow
        icon="stop-circle-outline"
        title="Завершить тренировку"
        onPress={onFinish}
        destructive
      />
    </View>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  trailingIcon,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  subtitle?: string;
  trailingIcon?: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
  destructive?: boolean;
}) {
  const tint = destructive ? COLORS.Text.negative : COLORS.Icon.secondary;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Icon name={icon} size={18} color={tint} />

      <View style={{ flex: 1 }}>
        <Typography
          variant="body"
          color={destructive ? COLORS.Text.negative : undefined}
        >
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            variant="caption"
            color={COLORS.Text.tertiary}
            numberOfLines={1}
          >
            {subtitle}
          </Typography>
        ) : null}
      </View>
      {trailingIcon ? (
        <Icon name={trailingIcon} size={18} color={tint} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: screenPadding,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tipsText: { marginTop: -spacing.xs, marginLeft: spacing.lg + spacing.sm },
});
