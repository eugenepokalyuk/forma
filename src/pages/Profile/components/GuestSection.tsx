import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthStore } from '@/modules/auth';
import { Button, Icon, Section, Typography } from '@/shared/ui';
import { SaveProgressSheet } from '@/pages/Profile/components/SaveProgressSheet';
import { COLORS, radius, spacing } from '@/theme';

// Только для гостя: напоминание, что прогресс не сохранён, и вход по почте
// (новой или от своего аккаунта).
export function GuestSection() {
  const isGuest = useAuthStore((s) => !!s.user?.isGuest);
  const [open, setOpen] = React.useState(false);

  if (!isGuest) return null;

  return (
    <Section padding>
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="alert-circle-outline" color={COLORS.Icon.accent} />
          <View style={styles.text}>
            <Typography variant="subtitle">{'Прогресс не сохранён'}</Typography>
            <Typography variant="body" color={COLORS.Text.secondary}>
              {
                'Вы в гостевом режиме: если выйти или удалить приложение, данные пропадут. Привяжите почту или войдите в свой аккаунт — прогресс перенесётся'
              }
            </Typography>
          </View>
        </View>

        <Button title="Сохранить прогресс" onPress={() => setOpen(true)} />
      </View>

      <SaveProgressSheet visible={open} onClose={() => setOpen(false)} />
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    backgroundColor: COLORS.Surface.primary,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
});
