import * as React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon, Input, Typography } from '@/components/ui';
import { COLORS, radius, spacing } from '@/theme';

interface NoteModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onClose: () => void;
}

// Заметка к следующему подходу — сохраняется вместе с ним (LogSetPayload.notes).
export function NoteModal({
  visible,
  value,
  onChange,
  onClose,
}: NoteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Typography variant="heading">Заметка к подходу</Typography>

            <Pressable onPress={onClose} hitSlop={12}>
              <Icon name="close" size={20} color={COLORS.Icon.secondary} />
            </Pressable>
          </View>

          <Input
            value={value}
            onChangeText={onChange}
            placeholder="Например: было тяжело последние 2 повтора"
            multiline
            autoFocus
          />

          <Button title="Готово" onPress={onClose} style={{ width: '100%' }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.Background.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
