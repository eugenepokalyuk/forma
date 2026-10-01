import * as React from 'react';
import { Alert } from 'react-native';

import { useAuthStore } from '@/modules/auth';
import {
  useBlockUser,
  useReport,
  type PostAuthor,
  type ReportReason,
  type ReportTarget,
} from '@/modules/social';

// Действия над чужим контентом: жалоба и блокировка автора (требование
// сторов к пользовательскому контенту). Возвращает состояние шторки жалобы
// для ReportSheet.
export function useContentActions() {
  const myPublicId = useAuthStore((s) => s.user?.publicId);
  const block = useBlockUser();
  const report = useReport();
  const [reportTarget, setReportTarget] = React.useState<ReportTarget | null>(
    null,
  );

  const isMine = (author: PostAuthor) => author.id === myPublicId;

  const confirmBlock = (author: PostAuthor) => {
    Alert.alert(
      `Заблокировать ${author.name}?`,
      'Вы перестанете видеть посты и комментарии друг друга, подписки будут отменены. Разблокировать можно в профиле.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Заблокировать',
          style: 'destructive',
          onPress: () => block.mutate(author.id),
        },
      ],
    );
  };

  const openActions = (target: ReportTarget, author: PostAuthor) => {
    Alert.alert(author.name, undefined, [
      { text: 'Пожаловаться', onPress: () => setReportTarget(target) },
      {
        text: 'Заблокировать',
        style: 'destructive',
        onPress: () => confirmBlock(author),
      },
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

  const submitReport = (reason: ReportReason) => {
    if (!reportTarget) return;
    report.mutate(
      { target: reportTarget, reason },
      {
        onSuccess: () => {
          setReportTarget(null);
          Alert.alert(
            'Жалоба отправлена',
            'Спасибо! Модератор проверит её в течение 24 часов.',
          );
        },
      },
    );
  };

  return {
    isMine,
    openActions,
    reportSheet: {
      visible: reportTarget !== null,
      onSelect: submitReport,
      onClose: () => setReportTarget(null),
    },
  };
}
