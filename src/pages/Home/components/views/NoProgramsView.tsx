import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Section, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

export function NoProgramsView() {
  return (
    <Section padding>
      <View style={styles.card}>
        <Typography variant="display">
          {'Выберите программу для тренировки'}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          style={{ marginBottom: spacing.sm }}
        >
          {
            'или создайте свою программу используя упражнения из нашего каталога'
          }
        </Typography>

        <Button
          title="К готовым программам"
          onPress={() => router.push(ROUTES.catalog)}
        />

        <Button
          title="Своя программа"
          variant="secondary"
          onPress={() =>
            Alert.alert(
              'Скоро',
              'Сборка своей тренировки появится в одном из следующих обновлений',
            )
          }
        />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    backgroundColor: COLORS.Surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    padding: spacing.md,
  },
});
