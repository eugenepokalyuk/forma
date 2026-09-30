import axios from 'axios';
import { router } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { sendOtp, verifyOtp } from '@/api/auth';
import { Typography } from '@/components/ui';
import { COLORS, motion, radius, spacing } from '@/theme';
import { ROUTES } from '@/utils/routes';
import { useAuthStore } from '@/store/auth';

const RESEND_SECONDS = 60;

export default function CodeScreen() {
  const { email } = ExpoRouter.useLocalSearchParams<{ email: string }>();
  const signIn = useAuthStore((s) => s.signIn);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const inputRef = React.useRef<TextInput>(null);

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
      const res = await verifyOtp(email, value);
      await signIn(res.data.accessToken, res.data.user);
      router.replace(ROUTES.home);
    } catch (e) {
      setCode('');

      if (axios.isAxiosError(e) && e.response?.status === 400) {
        setError('Неверный или просроченный код.');
      } else {
        setError('Не получилось войти. Проверьте связь.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangeCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);

    if (digits.length === 6) void submit(digits);
  };

  const resend = async () => {
    if (resendIn > 0) return;

    setResendIn(RESEND_SECONDS);
    setError(null);
    try {
      await sendOtp(email);
    } catch {
      setError('Не получилось отправить код повторно.');
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={motion.springSoft}
      style={styles.container}
    >
      <Typography variant="title" align="center">
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

      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={styles.digits}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const filled = i < code.length;
          const active = i === code.length;

          return (
            <MotiView
              key={i}
              from={filled ? { scale: 1.15 } : undefined}
              animate={{
                scale: 1,
                borderColor: active
                  ? COLORS.Stroke.accent
                  : filled
                    ? COLORS.Stroke.secondary
                    : COLORS.Stroke.primary,
                backgroundColor: filled
                  ? COLORS.Surface.secondary
                  : COLORS.Surface.primary,
              }}
              transition={motion.springy}
              style={styles.digitBox}
            >
              <Typography variant="heading" style={{ fontSize: 24 }}>
                {code[i] ?? ''}
              </Typography>
            </MotiView>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={code}
        onChangeText={onChangeCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        autoFocus
      />

      {error ? (
        <Typography variant="label" color={COLORS.Text.negative} align="center">
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Typography
          variant="label"
          color={COLORS.Text.secondary}
          align="center"
        >
          {'Проверяем'}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  digits: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  digitBox: {
    width: 46,
    height: 58,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
});
