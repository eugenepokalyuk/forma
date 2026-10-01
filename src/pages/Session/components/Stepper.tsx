import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import * as React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/shared/ui';
import { COLORS, TYPOGRAPHY, motion, radius, spacing } from '@/theme';

interface StepperProps {
  value: number;
  step: number;
  suffix?: string;
  min?: number;
  onChange: (value: number) => void;
  /** Компактный вариант — маленькие кнопки, для строки «лейбл слева / значение справа». */
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
      <RoundButton
        icon="minus"
        compact={compact}
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
            <Text style={compact ? styles.valueCompact : styles.value}>
              {value}

              {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
            </Text>
          </MotiView>
        </Pressable>
      )}

      <RoundButton
        icon="plus"
        compact={compact}
        onPress={() => bump(roundTo(value + step))}
      />
    </View>
  );
}

function RoundButton({
  icon,
  compact,
  onPress,
}: {
  icon: 'plus' | 'minus';
  compact?: boolean;
  onPress: () => void;
}) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <MotiView
      animate={{ scale: pressed ? 0.9 : 1 }}
      transition={motion.springy}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={compact ? styles.btnCompact : styles.btn}
      >
        <Icon name={icon} size={24} color={COLORS.Icon.primary} />
      </Pressable>
    </MotiView>
  );
}

function roundTo(n: number) {
  return Math.round(n * 100) / 100;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowCompact: { gap: spacing.sm },
  btn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.secondary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCompact: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: COLORS.Surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBox: { minWidth: 92, alignItems: 'center', paddingVertical: spacing.sm },
  valueBoxCompact: { minWidth: 50, alignItems: 'center' },
  value: { ...TYPOGRAPHY.title, color: COLORS.Text.primary },
  valueCompact: { ...TYPOGRAPHY.display, color: COLORS.Text.primary },
  suffix: { ...TYPOGRAPHY.body, color: COLORS.Text.secondary },
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
