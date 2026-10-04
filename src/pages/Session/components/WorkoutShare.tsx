import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as SafeArea from 'react-native-safe-area-context';

import type { WorkoutFinish } from '@/modules/workout';
import {
  Composer,
  DismissKeyboard,
  FadeInCover,
  Icon,
  Typography,
} from '@/shared/ui';
import { COLORS, hitTarget, screenPadding, spacing } from '@/theme';

import { usePostPhotos } from '@/pages/Session/hooks/usePostPhotos';
import { PhotoStrip } from '@/pages/Session/components/PhotoStrip';

type Post = NonNullable<WorkoutFinish['post']>;

interface WorkoutShareProps {
  onPublish: (post: Post) => void;
  onSkip: () => void;
  onBack: () => void;
}

// Пост в ленту: фото на всю ширину и подпись в поле с «+», стрелка
// публикует. Метрики и упражнения бэк возьмёт из сессии.
export function WorkoutShare({ onPublish, onSkip, onBack }: WorkoutShareProps) {
  const insets = SafeArea.useSafeAreaInsets();
  const [title, setTitle] = React.useState('');
  const photos = usePostPhotos();

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <DismissKeyboard
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xs,
            paddingBottom: insets.bottom + spacing.sm,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Назад"
            style={styles.headerButton}
          >
            <Icon name="chevron-left" size={32} />
          </Pressable>

          <Typography variant="subtitle" align="center" style={styles.title}>
            {'Поделиться тренировкой'}
          </Typography>

          <Pressable
            onPress={onSkip}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            style={[styles.headerButton, styles.skip]}
          >
            <Typography variant="label" color={COLORS.Text.secondary}>
              {'Пропустить'}
            </Typography>
          </Pressable>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <PhotoStrip
            uris={photos.uris}
            canAdd={photos.canAdd}
            onAdd={() => void photos.add()}
            onRemove={photos.remove}
          />

          <Typography
            variant="caption"
            color={COLORS.Text.tertiary}
            align="center"
          >
            {'Друзья увидят пост в ленте вместе с итогами тренировки'}
          </Typography>
        </ScrollView>

        <Composer
          value={title}
          onChangeText={setTitle}
          placeholder="Пара слов о тренировке…"
          maxLength={200}
          canSend
          sendLabel="Опубликовать"
          onSend={() =>
            onPublish({ title: title.trim(), photoUris: photos.uris })
          }
          attachOptions={
            photos.canAdd
              ? [
                  {
                    icon: 'image-outline',
                    label: 'Фото из галереи',
                    onPress: () => void photos.add(),
                  },
                ]
              : undefined
          }
        />

        <FadeInCover />
      </DismissKeyboard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  content: { flex: 1, paddingHorizontal: screenPadding, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    minWidth: hitTarget,
    height: hitTarget,
    justifyContent: 'center',
  },
  skip: { alignItems: 'flex-end' },
  title: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { gap: spacing.sm },
});
