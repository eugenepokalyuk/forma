import { Image } from 'expo-image';
import * as React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { CustomIcon, Input, Typography } from '@/components/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatRelativeTime } from '@/utils/helpers/date/relativeTime';
import { useAddComment, useComments } from '@/queries/social';

interface CommentsModalProps {
  postId: string | null;
  onClose: () => void;
}

export function CommentsModal({ postId, onClose }: CommentsModalProps) {
  const insets = SafeArea.useSafeAreaInsets();
  const [text, setText] = React.useState('');

  const { data: comments, isLoading } = useComments(postId);
  const addMutation = useAddComment(postId);

  return (
    <Modal
      visible={!!postId}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Оверлей — самостоятельный full-bleed контейнер (position: absolute
          через flex:1 + justifyContent:'flex-end'), а не соседний со шторкой
          flex-блок: раньше подложка была «привязана» к высоте шторки и
          визуально ездила вместе с ней при любом изменении её размера
          (клавиатура, контент) — казалось, что это двигающаяся тень. */}
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
          ]}
        >
          <View style={styles.handle} />

          <Typography
            variant="heading"
            align="center"
            style={{ marginBottom: spacing.md }}
          >
            {'Комментарии'}
          </Typography>

          <FlatList
            data={comments ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: spacing.md,
              paddingBottom: spacing.md,
            }}
            style={{ maxHeight: 360 }}
            ListEmptyComponent={
              !isLoading ? (
                <Typography
                  variant="body"
                  color={COLORS.Text.secondary}
                  align="center"
                  style={{ paddingVertical: spacing.lg }}
                >
                  {'Пока нет комментариев'}
                </Typography>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                {item.author.avatarUrl ? (
                  <Image
                    source={{ uri: item.author.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Typography variant="caption" color={COLORS.Text.inverse}>
                      {item.author.name.charAt(0).toUpperCase()}
                    </Typography>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: spacing.sm,
                      alignItems: 'baseline',
                    }}
                  >
                    <Typography variant="label">{item.author.name}</Typography>

                    <Typography variant="caption" color={COLORS.Text.tertiary}>
                      {formatRelativeTime(item.createdAt)}
                    </Typography>
                  </View>

                  <Typography variant="body">{item.text}</Typography>
                </View>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <Input
              style={styles.input}
              placeholder="Написать комментарий…"
              value={text}
              onChangeText={setText}
              multiline
            />
            <Pressable
              disabled={!text.trim() || addMutation.isPending}
              onPress={() =>
                addMutation.mutate(text.trim(), {
                  onSuccess: () => setText(''),
                })
              }
              style={styles.sendBtn}
            >
              <CustomIcon
                name="tg"
                size={26}
                color={text.trim() ? COLORS.Icon.accent : COLORS.Icon.tertiary}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.Overlay.scrim,
  },
  sheet: {
    backgroundColor: COLORS.Background.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.Stroke.secondary,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  commentRow: { flexDirection: 'row', gap: spacing.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.secondary,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Surface.accent,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: COLORS.Stroke.primary,
  },
  input: { flex: 1, minHeight: 40, maxHeight: 100 },
  sendBtn: { paddingBottom: 2 },
});
