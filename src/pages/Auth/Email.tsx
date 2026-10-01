import { isAxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { sendOtpApi } from '@/modules/auth';
import { Button, Input, Typography } from '@/shared/ui';
import { COLORS, motion, spacing } from '@/theme';
import { ROUTES } from '@/shared/constants/routes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const valid = EMAIL_RE.test(email.trim());

  const onSubmit = async () => {
    if (!valid || loading) return;

    setLoading(true);
    setError(null);

    try {
      await sendOtpApi(email.trim());
      router.push(ROUTES.authCode(email.trim()));
    } catch (e) {
      setError(
        isAxiosError(e)
          ? 'Не получилось отправить код. Проверьте связь.'
          : 'Что-то пошло не так.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['rgba(255,159,10,0.14)', 'rgba(0,0,0,0)']}
        style={styles.glow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={motion.springSoft}
        style={styles.content}
      >
        <Typography variant="hero" color={COLORS.Text.accent} align="center">
          {'Форма'}
        </Typography>

        <Typography
          variant="body"
          color={COLORS.Text.secondary}
          align="center"
          style={{ marginBottom: spacing.lg }}
        >
          {'Войдите по коду из письма'}
        </Typography>

        <Input
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          returnKeyType="send"
          onSubmitEditing={onSubmit}
        />

        {error ? (
          <Typography variant="label" color={COLORS.Text.negative}>
            {error}
          </Typography>
        ) : null}

        <Button
          title="Получить код"
          onPress={onSubmit}
          disabled={!valid}
          loading={loading}
          style={styles.button}
        />
      </MotiView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  button: { marginTop: spacing.sm },
});
