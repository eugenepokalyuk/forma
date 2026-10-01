import { router } from 'expo-router';
import * as React from 'react';
import { Alert } from 'react-native';

import type { WorkoutWithExercises } from '@/modules/programs';
import { ROUTES } from '@/shared/constants/routes';

import { completeWorkout, startWorkout } from '../services/workout';
import { useSessionStore } from '../store';

// Запуск тренировки с экрана: если уже идёт другая — спрашиваем, завершить
// ли её, затем открываем режим выполнения.
export function useStartWorkout() {
  return React.useCallback(
    (args: { programId: string; workout: WorkoutWithExercises }) => {
      const begin = () => {
        startWorkout(args);
        router.replace(ROUTES.sessionActive);
      };

      if (!useSessionStore.getState().active) {
        begin();
        return;
      }

      Alert.alert('Завершить текущую и начать новую?', undefined, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить и начать',
          style: 'destructive',
          onPress: () => {
            completeWorkout();
            begin();
          },
        },
      ]);
    },
    [],
  );
}
