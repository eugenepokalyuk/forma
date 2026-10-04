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
// без доступа вместо добавления рассказывает о ПРО.
export function ProgramAction({ program }: { program: Program }) {
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
        else addMutation.mutate();
      }}
      loading={addMutation.isPending}
    />
  );
}
