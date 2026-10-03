import * as React from 'react';
import { Alert } from 'react-native';

import { useSendIdea } from '@/modules/support';
import { compressImage } from '@/shared/lib/media/compressImage';
import { canPickImages, pickImages } from '@/shared/lib/media/pickImages';
import { BottomSheet, Composer, Typography } from '@/shared/ui';
import { COLORS } from '@/theme';

interface IdeaSheetProps {
  visible: boolean;
  onClose: () => void;
}

// Предложение идеи: текст и одна необязательная картинка. Уходит в админку.
export function IdeaSheet({ visible, onClose }: IdeaSheetProps) {
  const [text, setText] = React.useState('');
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const { mutate, isPending } = useSendIdea();

  const reset = () => {
    setText('');
    setImageUri(null);
  };

  const onPickImage = async () => {
    const [picked] = await pickImages(1);
    // Сжимаем в WebP сразу: и превью, и загрузка — с лёгким файлом.
    if (picked) setImageUri(await compressImage(picked));
  };

  const onSubmit = () =>
    mutate(
      { text: text.trim(), imageUri },
      {
        onSuccess: () => {
          reset();
          onClose();
          Alert.alert('Спасибо!', 'Мы прочитаем ваше предложение');
        },
      },
    );

  return (
    <BottomSheet visible={visible} title="Предложить идею" onClose={onClose}>
      <Typography variant="body" color={COLORS.Text.secondary}>
        {
          'Чего не хватает в приложении? Опишите идею, приложите скриншот или картинку'
        }
      </Typography>

      <Composer
        value={text}
        onChangeText={setText}
        placeholder="Хочу видеть рабочий вес"
        maxLength={4000}
        sending={isPending}
        sendLabel="Отправить идею"
        onSend={onSubmit}
        attachOptions={
          canPickImages && !imageUri
            ? [
                {
                  icon: 'image-outline',
                  label: 'Фото из галереи',
                  onPress: () => void onPickImage(),
                },
              ]
            : undefined
        }
        attachments={imageUri ? [imageUri] : []}
        onRemoveAttachment={() => setImageUri(null)}
      />
    </BottomSheet>
  );
}
