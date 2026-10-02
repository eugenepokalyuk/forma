import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { WorkoutFinish } from '@/modules/workout';
import { Button, Input } from '@/shared/ui';
import { spacing } from '@/theme';

import { usePostPhotos } from '@/pages/Session/hooks/usePostPhotos';
import { FinishStep } from '@/pages/Session/components/FinishStep';
import { PhotoStrip } from '@/pages/Session/components/PhotoStrip';

type Post = NonNullable<WorkoutFinish['post']>;

interface WorkoutShareProps {
  onPublish: (post: Post) => void;
  onSkip: () => void;
  onBack: () => void;
}

// Пост в ленту: фото и подпись. Метрики и упражнения бэк возьмёт из сессии.
export function WorkoutShare({ onPublish, onSkip, onBack }: WorkoutShareProps) {
  const [title, setTitle] = React.useState('');
  const photos = usePostPhotos();

  return (
    <FinishStep
      title="Поделиться тренировкой"
      subtitle="Покажите друзьям, как прошла тренировка"
      onBack={onBack}
      actions={
        <>
          <Button
            title="Опубликовать"
            onPress={() =>
              onPublish({ title: title.trim(), photoUris: photos.uris })
            }
          />
          <Button title="Не публиковать" variant="secondary" onPress={onSkip} />
        </>
      }
    >
      <View style={styles.form}>
        <PhotoStrip
          uris={photos.uris}
          canAdd={photos.canAdd}
          onAdd={() => void photos.add()}
          onRemove={photos.remove}
        />

        <Input
          placeholder="Пара слов о тренировке…"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
          multiline
        />
      </View>
    </FinishStep>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
});
