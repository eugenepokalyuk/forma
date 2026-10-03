import { Image } from 'expo-image';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { COLORS, motion, radius, shadow, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

// Кнопки поля — 40pt, с hitSlop зона касания 56pt: по ним попадают с
// первого раза, а поле при этом остаётся компактным.
const BUTTON = 40;
const BUTTON_SLOP = 8;
const THUMB = 64;

export interface ComposerAttachOption {
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface ComposerProps extends Pick<
  TextInputProps,
  'placeholder' | 'maxLength' | 'autoFocus' | 'onFocus'
> {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** По умолчанию — нельзя отправить пустой текст. */
  canSend?: boolean;
  sending?: boolean;
  sendLabel?: string;
  /** Пункты меню «+». Без них плюса нет. */
  attachOptions?: ComposerAttachOption[];
  /** Выбранные картинки — превью над полем. */
  attachments?: string[];
  onRemoveAttachment?: (uri: string) => void;
}

// Поле сообщения: «+» слева открывает меню вложений, справа — крупная
// кнопка отправки. Один вид для комментариев, постов и обратной связи.
export function Composer({
  value,
  onChangeText,
  onSend,
  canSend = value.trim().length > 0,
  sending = false,
  sendLabel = 'Отправить',
  attachOptions,
  attachments = [],
  onRemoveAttachment,
  ...inputProps
}: ComposerProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const sendEnabled = canSend && !sending;

  const pick = (option: ComposerAttachOption) => {
    setMenuOpen(false);
    option.onPress();
  };

  return (
    <View style={styles.wrapper}>
      {attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.thumbs}
        >
          {attachments.map((uri) => (
            <View key={uri}>
              <Image source={{ uri }} style={styles.thumb} contentFit="cover" />

              {onRemoveAttachment ? (
                <Pressable
                  onPress={() => onRemoveAttachment(uri)}
                  hitSlop={spacing.sm}
                  accessibilityRole="button"
                  accessibilityLabel="Убрать картинку"
                  style={styles.thumbRemove}
                >
                  <Icon name="close" size={14} color={COLORS.Text.primary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* Меню всплывает над полем поверх соседних блоков, не сдвигая их. */}
      <View style={styles.barWrap}>
        <AnimatePresence>
          {menuOpen && attachOptions ? (
            <MotiView
              from={{ opacity: 0, translateY: 8, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              exit={{ opacity: 0, translateY: 8, scale: 0.96 }}
              transition={motion.springy}
              style={styles.menu}
            >
              {attachOptions.map((option) => (
                <Pressable
                  key={option.label}
                  onPress={() => pick(option)}
                  accessibilityRole="menuitem"
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <Icon
                    name={option.icon}
                    size={22}
                    color={COLORS.Icon.accent}
                  />

                  <Typography variant="body">{option.label}</Typography>
                </Pressable>
              ))}
            </MotiView>
          ) : null}
        </AnimatePresence>

        <View style={styles.bar}>
          {attachOptions?.length ? (
            <Pressable
              onPress={() => setMenuOpen((open) => !open)}
              hitSlop={BUTTON_SLOP}
              accessibilityRole="button"
              accessibilityLabel="Вложения"
              accessibilityState={{ expanded: menuOpen }}
              style={styles.plus}
            >
              <MotiView
                animate={{ rotate: menuOpen ? '45deg' : '0deg' }}
                transition={motion.springy}
              >
                <Icon name="plus" size={26} color={COLORS.Icon.primary} />
              </MotiView>
            </Pressable>
          ) : null}

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={COLORS.Text.tertiary}
            multiline
            style={styles.input}
            {...inputProps}
          />

          <Pressable
            onPress={onSend}
            disabled={!sendEnabled}
            hitSlop={BUTTON_SLOP}
            accessibilityRole="button"
            accessibilityLabel={sendLabel}
            accessibilityState={{ disabled: !sendEnabled, busy: sending }}
            style={[
              styles.send,
              {
                backgroundColor: sendEnabled
                  ? COLORS.Surface.accent
                  : COLORS.Surface.secondary,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.Icon.inverse} />
            ) : (
              <Icon
                name="arrow-up"
                size={24}
                color={sendEnabled ? COLORS.Icon.inverse : COLORS.Icon.tertiary}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  thumbs: { gap: spacing.sm, paddingTop: spacing.xs },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: radius.md,
    backgroundColor: COLORS.Surface.secondary,
  },
  thumbRemove: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Surface.tertiary,
  },
  barWrap: { zIndex: 1 },
  menu: {
    position: 'absolute',
    left: 0,
    bottom: '100%',
    marginBottom: spacing.sm,
    zIndex: 1,
    minWidth: 220,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: COLORS.Surface.secondary,
    ...shadow.floating,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: radius.md,
  },
  menuItemPressed: { backgroundColor: COLORS.Surface.tertiary },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: COLORS.Stroke.primary,
    backgroundColor: COLORS.Surface.primary,
  },
  plus: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Surface.secondary,
  },
  input: {
    flex: 1,
    minHeight: BUTTON,
    maxHeight: 120,
    paddingHorizontal: spacing.sm,
    // Одна строка — по центру кнопок; многострочный текст растёт вверх.
    paddingTop: 10,
    paddingBottom: 10,
    color: COLORS.Text.primary,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  send: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
