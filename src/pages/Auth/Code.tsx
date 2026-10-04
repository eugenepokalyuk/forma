import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { sendOtpApi, signIn, verifyOtpApi } from '@/modules/auth';
import { CodeInput, DismissKeyboard, Typography } from '@/shared/ui';
import { COLORS, motion, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

const RESEND_SECONDS = 60;

export default function CodeScreen() {
  const { email } = ExpoRouter.useLocalSearchParams<{ email: string }>();
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);

    return () => clearInterval(t);
  }, [resendIn]);

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
    if (resendIn > 0) return;

    setResendIn(RESEND_SECONDS);
    setError(null);
    try {
      await sendOtpApi(email);
    } catch {
      setError('Не получилось отправить код повторно.');
    }
  };

  return (
    <DismissKeyboard style={styles.fill}>
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
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
          <Pressable onPress={resend} disabled={resendIn > 0}>
            <Typography
              variant="label"
              color={resendIn > 0 ? COLORS.Text.tertiary : COLORS.Text.accent}
            >
              {resendIn > 0
                ? `Отправить ещё раз (${resendIn}с)`
                : 'Отправить ещё раз'}
            </Typography>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Typography variant="label" color={COLORS.Text.accent}>
              {'Изменить email'}
            </Typography>
          </Pressable>
        </View>
      </MotiView>
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
