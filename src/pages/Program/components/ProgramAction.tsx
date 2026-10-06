import { Alert } from 'react-native';

import { showProInfo, useAuthStore } from '@/modules/auth';
import {
  useAddUserProgram,
  useRemoveUserProgram,
  useUserPrograms,
  type Program,
} from '@/modules/programs';
import { Button } from '@/shared/ui';

// Кнопка на обложке: «Выбрать программу» или «Отписаться». ПРО-программа
// без доступа вместо добавления рассказывает о ПРО. После добавления —
// предложение сразу начать тренировку (onStartWorkout — обычный запуск).
export function ProgramAction({
  program,
  onStartWorkout,
}: {
  program: Program;
  onStartWorkout: () => void;
}) {
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);
  const { data: userPrograms } = useUserPrograms();
  const addMutation = useAddUserProgram(program.id);
  const removeMutation = useRemoveUserProgram();

  const userProgram = (userPrograms ?? []).find(
    (up) => up.programId === program.id,
  );

  if (userProgram) {
    const onRemove = () =>
      Alert.alert(
        'Отписаться от программы?',
        'Она пропадёт из «Моих программ». История тренировок сохранится.',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Отписаться',
            style: 'destructive',
            onPress: () => removeMutation.mutate(userProgram.id),
          },
        ],
      );

    return (
      <Button
        title="Отписаться от программы"
        variant="secondary"
        onPress={onRemove}
        loading={removeMutation.isPending}
      />
    );
  }

  return (
    <Button
      title="Выбрать программу"
      onPress={() => {
        if (program.tier === 'pro' && !hasProAccess) showProInfo();
        else
          addMutation.mutate(undefined, {
            onSuccess: () => confirmStart(program.title, onStartWorkout),
          });
      }}
      loading={addMutation.isPending}
    />
  );
}

function confirmStart(title: string, onStart: () => void) {
  Alert.alert(
    'Программа добавлена',
    `«${title}» теперь в ваших программах. Начните первую тренировку сейчас или вернитесь к ней позже — выбранные программы всегда под рукой на главном экране.`,
    [
      { text: 'Позже', style: 'cancel' },
      { text: 'Начать тренировку', onPress: onStart },
    ],
  );
}
