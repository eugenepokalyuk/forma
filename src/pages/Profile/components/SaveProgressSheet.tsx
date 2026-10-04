import { isAxiosError } from 'axios';
import * as React from 'react';
import { Pressable } from 'react-native';

import { claimGuest, sendGuestOtpApi } from '@/modules/auth';
import { BottomSheet, Button, Input, toast, Typography } from '@/shared/ui';
import { COLORS, spacing } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SaveProgressSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Ошибка входа: 400 на шаге кода — неверный код, на шаге почты — текст с
// сервера; остальное — связь.
function errorText(e: unknown, step: 'email' | 'code') {
  if (!isAxiosError(e)) return 'Что-то пошло не так.';
  const status = e.response?.status;
  const detail = (e.response?.data as { detail?: string } | undefined)?.detail;
  if (status === 400 && step === 'code') return 'Неверный или просроченный код';
  if (status === 400 && detail) return detail;
  return 'Не получилось. Проверьте связь.';
}

// Вход гостя по почте: почта → код из письма. Почта свободна — гость
// становится обычным аккаунтом; у почты есть аккаунт — прогресс гостя
// переезжает в него.
export function SaveProgressSheet({
  visible,
  onClose,
}: SaveProgressSheetProps) {
  const [step, setStep] = React.useState<'email' | 'code'>('email');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [existing, setExisting] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const trimmed = email.trim().toLowerCase();

  const close = () => {
    onClose();
    setStep('email');
    setCode('');
    setError(null);
  };

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e, step));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      const res = await sendGuestOtpApi(trimmed);
      setExisting(res.existing);
      setCode('');
      setStep('code');
    });

  const claim = () =>
    run(async () => {
      const { merged } = await claimGuest(trimmed, code);
      close();
      toast.show({
        type: 'success',
        title: merged ? 'Вы вошли, прогресс перенесён' : 'Прогресс сохранён',
      });
    });

  return (
    <BottomSheet visible={visible} title="Сохранить прогресс" onClose={close}>
      {step === 'email' ? (
        <>
          <Typography variant="body" color={COLORS.Text.secondary}>
            {
              'Укажите почту — новую или от своего аккаунта. Программы, тренировки и прогресс останутся с вами, а войти можно будет с любого телефона'
            }
          </Typography>

          <Input
            placeholder="Эл. почта"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            returnKeyType="send"
            onSubmitEditing={() => void sendCode()}
          />
        </>
      ) : (
        <>
          <Typography variant="body" color={COLORS.Text.secondary}>
            {existing
              ? `Отправили код на ${trimmed}. У этой почты уже есть аккаунт — войдём в него и перенесём туда гостевой прогресс`
              : `Отправили код на ${trimmed}`}
          </Typography>

          <Input
            placeholder="Код из письма"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
            autoFocus
          />
        </>
      )}

      {error ? (
        <Typography variant="label" color={COLORS.Text.negative}>
          {error}
        </Typography>
      ) : null}

      {step === 'email' ? (
        <Button
          title="Получить код"
          onPress={() => void sendCode()}
          disabled={!EMAIL_RE.test(trimmed)}
          loading={loading}
        />
      ) : (
        <>
          <Button
            title={existing ? 'Войти и перенести' : 'Сохранить прогресс'}
            onPress={() => void claim()}
            disabled={code.length !== 6}
            loading={loading}
          />

          <Pressable
            onPress={() => {
              setStep('email');
              setError(null);
            }}
            accessibilityRole="button"
            hitSlop={spacing.sm}
          >
            <Typography
              variant="subtitle"
              color={COLORS.Text.secondary}
              align="center"
            >
              {'Изменить почту'}
            </Typography>
          </Pressable>
        </>
      )}
    </BottomSheet>
  );
}
