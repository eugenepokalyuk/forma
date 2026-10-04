import { isAxiosError } from 'axios';
import * as React from 'react';

import { claimGuest, isValidEmail, sendGuestOtpApi } from '@/modules/auth';
import { ResendCodeButton } from '@/modules/auth/ui';
import {
  BottomSheet,
  Button,
  CodeInput,
  Input,
  TextButton,
  toast,
  Typography,
} from '@/shared/ui';
import { COLORS } from '@/theme';

interface SaveProgressSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Ошибка входа: 400 на шаге кода — неверный код, на шаге почты — текст с
// сервера; остальное — связь.
function errorText(e: unknown, step: 'email' | 'code') {
  if (!isAxiosError(e)) return 'Что-то пошло не так';
  const status = e.response?.status;
  const detail = (e.response?.data as { detail?: string } | undefined)?.detail;
  if (status === 400 && step === 'code') return 'Неверный или просроченный код';
  if (status === 400 && detail) return detail;
  return 'Не получилось. Проверьте связь';
}

// Ошибки сервера и сети — тостом поверх шторки (BottomSheet держит свой слой
// тостов); неверная почта — рамкой и тряской поля.
function showError(title: string) {
  toast.show({ id: 'save-progress-error', type: 'error', title });
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
  // Неверная почта — красная рамка и тряска поля (shakeKey — номер попытки).
  const [invalid, setInvalid] = React.useState(false);
  const [shakeKey, setShakeKey] = React.useState(0);

  const trimmed = email.trim().toLowerCase();

  const close = () => {
    onClose();
    setStep('email');
    setCode('');
    setInvalid(false);
  };

  const run = async (action: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    try {
      await action();
    } catch (e) {
      // Неверный код стираем — вводить заново, как на экране входа.
      if (step === 'code') setCode('');
      showError(errorText(e, step));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () => {
    if (!isValidEmail(trimmed)) {
      setInvalid(true);
      setShakeKey((n) => n + 1);
      return;
    }
    return run(async () => {
      const res = await sendGuestOtpApi(trimmed);
      setExisting(res.existing);
      setCode('');
      setStep('code');
    });
  };

  const resend = async () => {
    try {
      await sendGuestOtpApi(trimmed);
    } catch {
      showError('Не получилось отправить код повторно');
    }
  };

  // Введены все цифры — отправляем сразу, как на экране входа.
  const claim = (digits = code) =>
    run(async () => {
      const { merged } = await claimGuest(trimmed, digits);
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
              'Укажите почту — новую или от своего аккаунта. Программы, тренировки и прогресс останутся с вами, а войти можно будет с любого устройства'
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
            onChangeText={(text) => {
              setEmail(text);
              setInvalid(false);
            }}
            returnKeyType="send"
            onSubmitEditing={() => void sendCode()}
            error={invalid}
            shakeKey={shakeKey}
          />
        </>
      ) : (
        <>
          <Typography variant="body" color={COLORS.Text.secondary}>
            {existing
              ? `Отправили код на ${trimmed}. У этой почты уже есть аккаунт — войдём в него и перенесём туда гостевой прогресс`
              : `Отправили код на ${trimmed}`}
          </Typography>

          <CodeInput
            value={code}
            onChangeText={setCode}
            onComplete={(digits) => void claim(digits)}
            autoFocus
          />
        </>
      )}

      {step === 'email' ? (
        <Button
          title="Получить код"
          onPress={() => void sendCode()}
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

          <ResendCodeButton onResend={() => void resend()} />

          <TextButton title="Изменить почту" onPress={() => setStep('email')} />
        </>
      )}
    </BottomSheet>
  );
}
