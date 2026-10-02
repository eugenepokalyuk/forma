import { Image } from 'expo-image';
import * as React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useSendIdea } from '@/modules/support';
import { compressImage } from '@/shared/lib/media/compressImage';
import { canPickImages, pickImages } from '@/shared/lib/media/pickImages';
import { BottomSheet, Button, Icon, Input, Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

const PREVIEW_HEIGHT = 160;

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
          'Чего не хватает в приложении? Опишите идею, приложи скриншот или картинку'
        }
      </Typography>

      <Input
        value={text}
        onChangeText={setText}
        placeholder="Например: хочу видеть график рабочего веса"
        multiline
        maxLength={4000}
        style={styles.input}
      />

      {imageUri ? (
        <View style={styles.preview}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />

          <Pressable
            onPress={() => setImageUri(null)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Убрать картинку"
            style={styles.remove}
          >
            <Icon name="close" size={20} color={COLORS.Text.primary} />
          </Pressable>
        </View>
      ) : canPickImages ? (
        <Pressable
          onPress={() => void onPickImage()}
          accessibilityRole="button"
          style={styles.add}
        >
          <Icon name="image-plus" size={20} color={COLORS.Icon.primary} />

          <Typography variant="body" color={COLORS.Text.secondary}>
            {'Приложить картинку'}
          </Typography>
        </Pressable>
      ) : null}

      <Button
        title="Отправить"
        onPress={onSubmit}
        loading={isPending}
        disabled={text.trim().length === 0}
        style={{ width: '100%' }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 120 },
  preview: { height: PREVIEW_HEIGHT },
  image: { flex: 1, borderRadius: radius.lg },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.Stroke.secondary,
  },
  remove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Overlay.backdrop,
  },
});
