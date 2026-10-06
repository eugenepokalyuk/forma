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
  toast,
  Typography,
} from '@/shared/ui';
import { COLORS, motion, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

// Ошибки — тостом, как на экране почты: под ячейками кода ничего не прыгает.
function showError(title: string) {
  toast.show({ id: 'auth-error', type: 'error', title });
}

export default function CodeScreen() {
  const { email } = ExpoRouter.useLocalSearchParams<{ email: string }>();
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (value: string) => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    try {
      const res = await verifyOtpApi(email, value);
      await signIn(res.accessToken, res.user);
      router.replace(ROUTES.home);
    } catch (e) {
      setCode('');
      showError(
        isAxiosError(e) && e.response?.status === 400
          ? 'Неверный или просроченный код'
          : 'Не получилось войти. Проверьте связь',
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await sendOtpApi(email);
    } catch {
      showError('Не получилось отправить код повторно');
    }
  };

  return (
    <DismissKeyboard style={styles.fill}>
      <MotiView
        from={{ translateY: 16 }}
        animate={{ translateY: 0 }}
        transition={motion.springSoft}
        style={styles.container}
      >
        {/* Заголовок целиком, капсом: текст белый, почта — серая. */}
        <Typography variant="display" align="center">
          {'Отправили код на почту '}

          <Typography variant="display" color={COLORS.Text.secondary}>
            {email}
          </Typography>
        </Typography>

        <CodeInput
          value={code}
          onChangeText={setCode}
          onComplete={(digits) => void submit(digits)}
          autoFocus
        />

        <View style={styles.footer}>
          <ResendCodeButton onResend={() => void resend()} />

          <TextButton
            title="Изменить эл. почту"
            onPress={() => router.back()}
          />
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
    padding: spacing.md,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
});
