import * as React from 'react';

import { TextButton } from '@/shared/ui';

// Повторно код — не раньше чем через минуту после прошлой отправки.
const RESEND_SECONDS = 60;

// «Отправить ещё раз» под полем кода: минута ожидания идёт с появления
// кнопки (код только что ушёл) и заново после каждого нажатия. Ошибку
// отправки показывает вызывающий экран.
export function ResendCodeButton({ onResend }: { onResend: () => void }) {
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);

    return () => clearTimeout(t);
  }, [secondsLeft]);

  const waiting = secondsLeft > 0;

  return (
    <TextButton
      title={
        waiting
          ? `Отправить код повторно через ${secondsLeft} сек`
          : 'Отправить код повторно'
      }
      disabled={waiting}
      onPress={() => {
        setSecondsLeft(RESEND_SECONDS);
        onResend();
      }}
    />
  );
}
