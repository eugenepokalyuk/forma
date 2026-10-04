import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { GlassIconButton, Typography } from '@/shared/ui';
import { COLORS, TYPOGRAPHY, motion, spacing } from '@/theme';

interface StepperProps {
  value: number;
  step: number;
  suffix?: string;
  min?: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

// Степперы веса (±2,5 кг) и повторений (±1) + тап по числу — цифровая клавиатура.
export function Stepper({
  value,
  step,
  suffix,
  min = 0,
  onChange,
  compact,
}: StepperProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));

  const bump = (next: number) => {
    void Haptics.selectionAsync();
    onChange(Math.max(min, next));
  };

  const commit = () => {
    const parsed = Number(draft.replace(',', '.'));
    setEditing(false);
    if (!Number.isNaN(parsed)) onChange(Math.max(min, parsed));
  };

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <GlassIconButton
        icon="minus"
        accessibilityLabel="Уменьшить"
        onPress={() => bump(roundTo(value - step))}
      />

      {editing ? (
        <TextInput
          autoFocus
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          style={[styles.input, compact && styles.inputCompact]}
        />
      ) : (
        <Pressable
          onPress={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          style={compact ? styles.valueBoxCompact : styles.valueBox}
        >
          <MotiView
            key={value}
            from={{ scale: 1.18 }}
            animate={{ scale: 1 }}
            transition={motion.springy}
          >
            <Typography variant="display">{value}</Typography>

            {/*{suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}*/}
          </MotiView>
        </Pressable>
      )}

      <GlassIconButton
        icon="plus"
        variant="accent"
        accessibilityLabel="Увеличить"
        onPress={() => bump(roundTo(value + step))}
      />
    </View>
  );
}

function roundTo(n: number) {
  return Math.round(n * 100) / 100;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowCompact: { gap: spacing.sm },
  valueBox: { minWidth: 92, alignItems: 'center', paddingVertical: spacing.sm },
  valueBoxCompact: { minWidth: 50, alignItems: 'center' },
  value: { ...TYPOGRAPHY.title, color: COLORS.Text.primary },
  valueCompact: { ...TYPOGRAPHY.display, color: COLORS.Text.primary },
  suffix: { ...TYPOGRAPHY.display, color: COLORS.Text.secondary },
  input: {
    minWidth: 92,
    textAlign: 'center',
    ...TYPOGRAPHY.title,
    color: COLORS.Text.primary,
    borderBottomWidth: 2,
    borderColor: COLORS.Stroke.accent,
  },
  inputCompact: {
    minWidth: 32,
    ...TYPOGRAPHY.subtitle,
    borderBottomWidth: 1,
  },
});
