import { router } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { signInAsGuest } from '@/modules/auth';
import { alertActionFailed } from '@/shared/lib/alerts/alertActionFailed';
import {
  BottomSheet,
  Button,
  Icon,
  Typography,
  type IconName,
} from '@/shared/ui';
import { ROUTES } from '@/shared/constants/routes';
import { COLORS, spacing } from '@/theme';

const POINTS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'dumbbell',
    title: 'Всё работает',
    description:
      'Программы, тренировки и\u00A0статистика\u00A0—\u00A0без ограничений',
  },
  {
    icon: 'cellphone-lock',
    title: 'Прогресс привязан к этому телефону',
    description:
      'Если выйти из аккаунта, удалить приложение или сменить телефон, прогресс пропадёт навсегда',
  },
  {
    icon: 'email-check-outline',
    title: 'Сохранить можно в любой момент',
    description:
      'Привяжите почту или войдите в свой аккаунт из профиля — прогресс перенесётся',
  },
];

interface GuestSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Объясняем, чем гостевой вход отличается от обычного, и впускаем только
// после согласия.
export function GuestSheet({ visible, onClose }: GuestSheetProps) {
  const [loading, setLoading] = React.useState(false);

  const onAgree = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      router.replace(ROUTES.home);
    } catch {
      alertActionFailed('войти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="Без сохранения прогресса"
      onClose={onClose}
    >
      <View style={styles.points}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <Icon name={p.icon} size={24} color={COLORS.Icon.accent} />
            <View style={styles.pointText}>
              <Typography variant="subtitle">{p.title}</Typography>
              <Typography variant="body" color={COLORS.Text.secondary}>
                {p.description}
              </Typography>
            </View>
          </View>
        ))}
      </View>

      <Button
        title="Понятно, войти"
        onPress={() => void onAgree()}
        loading={loading}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  points: { gap: spacing.lg, marginBottom: spacing.sm },
  point: { flexDirection: 'row', gap: spacing.md },
  pointText: { flex: 1, gap: spacing.xs },
});
