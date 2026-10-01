import { BottomSheet, Button, Input } from '@/shared/ui';

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
    <BottomSheet visible={visible} title="Заметка к подходу" onClose={onClose}>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Например: было тяжело последние 2 повтора"
        multiline
        autoFocus
      />

      <Button title="Готово" onPress={onClose} style={{ width: '100%' }} />
    </BottomSheet>
  );
}
