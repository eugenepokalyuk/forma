import { StyleSheet, View } from 'react-native';

import { useReactions, type ReactionValue } from '@/modules/programs';
import { Button } from '@/shared/ui';
import { spacing } from '@/theme';

import { FinishStep } from '@/pages/Session/components/FinishStep';
import { ReactionCard } from '@/pages/Session/components/ReactionCard';

interface WorkoutFeedbackProps {
  value: ReactionValue | null;
  onChange: (reaction: ReactionValue) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
}

// Оценка тренировки — одна из реакций справочника (как на сайте).
export function WorkoutFeedback({
  value,
  onChange,
  onSubmit,
  onSkip,
  onBack,
}: WorkoutFeedbackProps) {
  const { data: reactions = [] } = useReactions();

  return (
    <FinishStep
      title="Как вам тренировка?"
      subtitle="Скорректируем программу под вас"
      onBack={onBack}
      actions={
        <>
          <Button title="Отправить" onPress={onSubmit} disabled={!value} />
          <Button title="Пропустить" variant="secondary" onPress={onSkip} />
        </>
      }
    >
      <View style={styles.grid} accessibilityRole="radiogroup">
        {reactions.map((reaction) => (
          <ReactionCard
            key={reaction.value}
            reaction={reaction}
            selected={reaction.value === value}
            onPress={() => onChange(reaction.value)}
          />
        ))}
      </View>
    </FinishStep>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
