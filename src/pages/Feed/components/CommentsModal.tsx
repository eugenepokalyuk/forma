import { Image } from 'expo-image';
import * as React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import {
  BottomSheet,
  CustomIcon,
  ErrorState,
  Input,
  Typography,
} from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatRelativeTime } from '@/shared/lib/date/relativeTime';
import { useAddComment, useComments } from '@/modules/social';
import { ReportSheet } from '@/pages/Feed/components/ReportSheet';
import { useContentActions } from '@/pages/Feed/hooks/useContentActions';

interface CommentsModalProps {
  postId: string | null;
  onClose: () => void;
}

export function CommentsModal({ postId, onClose }: CommentsModalProps) {
  const [text, setText] = React.useState('');

  const { data: comments, isLoading, isError, refetch } = useComments(postId);
  const addMutation = useAddComment(postId);
  const actions = useContentActions();

  return (
    <BottomSheet
      visible={!!postId}
      title="Комментарии"
      onClose={onClose}
      maxHeight="80%"
    >
      <FlatList
        data={comments ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: spacing.md,
          paddingBottom: spacing.md,
        }}
        style={{ maxHeight: 360, flexShrink: 1 }}
        ListEmptyComponent={
          isError ? (
            <ErrorState onRetry={refetch} />
          ) : !isLoading ? (
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
          // Долгое нажатие на чужой комментарий — пожаловаться/заблокировать.
          <Pressable
            style={styles.commentRow}
            disabled={actions.isMine(item.author) || !postId}
            onLongPress={() =>
              postId &&
              actions.openActions(
                { kind: 'comment', postId, commentId: item.id },
                item.author,
              )
            }
            accessibilityHint={
              actions.isMine(item.author)
                ? undefined
                : 'Удерживайте, чтобы пожаловаться или заблокировать'
            }
          >
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
          </Pressable>
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
          accessibilityRole="button"
          accessibilityLabel="Отправить комментарий"
          accessibilityState={{
            disabled: !text.trim() || addMutation.isPending,
          }}
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
      <ReportSheet {...actions.reportSheet} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
