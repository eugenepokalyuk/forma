import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { sendOtpApi, signIn, verifyOtpApi } from '@/modules/auth';
import { ResendCodeButton } from '@/modules/auth/ui';
import {
  CodeInput,
  DismissKeyboard,
  FadeInCover,
  TextButton,
  Typography,
} from '@/shared/ui';
import { COLORS, motion, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

export default function CodeScreen() {
  const { email } = ExpoRouter.useLocalSearchParams<{ email: string }>();
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (value: string) => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await verifyOtpApi(email, value);
      await signIn(res.accessToken, res.user);
      router.replace(ROUTES.home);
    } catch (e) {
      setCode('');

      if (isAxiosError(e) && e.response?.status === 400) {
        setError('Неверный или просроченный код.');
      } else {
        setError('Не получилось войти. Проверьте связь.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      await sendOtpApi(email);
    } catch {
      setError('Не получилось отправить код повторно.');
    }
  };

  return (
    <DismissKeyboard style={styles.fill}>
      {/* Появление — сдвигом и FadeInCover, без opacity у содержимого:
          внутри полупрозрачного родителя iOS не рисует стекло ячеек кода. */}
      <MotiView
        from={{ translateY: 16 }}
        animate={{ translateY: 0 }}
        transition={motion.springSoft}
        style={styles.container}
      >
        <Typography variant="hero" align="center">
          {'Код из письма'}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          align="center"
          style={{ marginBottom: spacing.md }}
        >
          {`Отправили на ${email}`}
        </Typography>

        <CodeInput
          value={code}
          onChangeText={setCode}
          onComplete={(digits) => void submit(digits)}
          autoFocus
        />

        {error ? (
          <Typography
            variant="label"
            color={COLORS.Text.negative}
            align="center"
          >
            {error}
          </Typography>
        ) : null}

        <View style={styles.footer}>
          <ResendCodeButton onResend={() => void resend()} />

          <TextButton title="Изменить почту" onPress={() => router.back()} />
        </View>
      </MotiView>

      <FadeInCover />
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.Background.primary },
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
});
