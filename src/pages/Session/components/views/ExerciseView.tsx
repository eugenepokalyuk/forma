import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import type { Exercise } from '@/modules/programs';
import {
  discardWorkout,
  hideExercise,
  isExerciseDone,
  isExerciseSkipped,
  logSet,
  skipExercise,
  type ActiveSession,
} from '@/modules/workout';
import { ExerciseActionsList } from '@/pages/Session/components/ExerciseActionsList';
import { ExerciseHeaderCard } from '@/pages/Session/components/ExerciseHeaderCard';
import { ExerciseInput } from '@/pages/Session/components/ExerciseInput';
import { ExerciseMediaCard } from '@/pages/Session/components/ExerciseMediaCard';
import {
  ExercisePickerSheet,
  type ExercisePickerMode,
} from '@/pages/Session/components/ExercisePickerSheet';
import { ExerciseProgressBar } from '@/pages/Session/components/ExerciseProgressBar';
import { NoteModal } from '@/pages/Session/components/NoteModal';
import { SetPills } from '@/pages/Session/components/SetPills';
import { Divider, FadeInCover, Typography } from '@/shared/ui';
import { COLORS, motion, radius, screenPadding, spacing } from '@/theme';

interface ExerciseViewProps {
  active: ActiveSession;
  totalSetsOf: (ex: Exercise) => number;
  onAddSet: (exerciseId: string) => void;
  onRemoveExtraSet: (exerciseId: string) => void;
  noteDraft: string;
  onNoteChange: (text: string) => void;
  onNavigate: (index: number) => void;
  onJump: (delta: number) => void;
  // Подход записан — дальше отдых.
  onLogged: () => void;
  onFinish: () => void;
}

// Текущее упражнение: прогресс по тренировке, медиа, подходы и ввод,
// описание и список действий (заметка, пропуск, добавить / заменить /
// скрыть упражнение, завершить).
export function ExerciseView({
  active,
  totalSetsOf,
  onAddSet,
  onRemoveExtraSet,
  noteDraft,
  onNoteChange,
  onNavigate,
  onJump,
  onLogged,
  onFinish,
}: ExerciseViewProps) {
  const insets = SafeArea.useSafeAreaInsets();
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [picker, setPicker] = React.useState<ExercisePickerMode | null>(null);

  const exercises = active.workout.exercises;
  const index = active.currentExerciseIndex;
  const exercise = exercises[index];

  const handleLog = (
    setNumber: number,
    values: {
      repsDone?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
    },
  ) => {
    logSet({ id: exercise.id, restSeconds: exercise.restSeconds }, setNumber, {
      ...values,
      notes: noteDraft || null,
    });
    onNoteChange('');
    onLogged();
  };

  // Скрыть своё упражнение — разовое или «каждый раз». Последнее упражнение
  // тренировки не скрываем.
  const onHide =
    exercise.isCustom && exercises.length > 1
      ? () => confirmHide(active, exercise)
      : undefined;

  const tips =
    [exercise.notes, exercise.additionalInfo].filter(Boolean).join('\n\n') ||
    null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      {/* В шапке — только номер упражнения; «Добавить упражнение» и
          «Завершить тренировку» — в списке действий внизу экрана. */}
      <View style={styles.header}>
        <Typography
          variant="title"
          accessibilityLabel={`Упражнение ${index + 1} из ${exercises.length}`}
        >
          {index + 1}/{exercises.length}
        </Typography>
      </View>

      <View style={{ paddingHorizontal: screenPadding }}>
        <ExerciseProgressBar
          states={exercises.map((ex, i) =>
            i === index
              ? 'current'
              : isExerciseDone(ex, active.logs, totalSetsOf(ex))
                ? 'done'
                : isExerciseSkipped(ex, active.logs)
                  ? 'skipped'
                  : 'pending',
          )}
          onPressSegment={onNavigate}
        />
      </View>

      <AnimatePresence exitBeforeEnter>
        {/* Ключ — с упражнением каталога: замена (тот же id) проигрывает
            переход, как смена упражнения, и прокрутка уходит наверх. */}
        <MotiView
          key={`${exercise.id}:${exercise.catalogExerciseId}`}
          from={{ translateX: 24 }}
          animate={{ translateX: 0 }}
          exit={{ opacity: 0, translateX: -24 }}
          transition={motion.springSoft}
          style={styles.body}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            // «Завершить тренировку» — последним, не должен прилипать
            // к home indicator.
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
          >
            <View style={styles.section}>
              <ExerciseMediaCard exercise={exercise} />

              <SetPills
                exercise={exercise}
                totalSets={totalSetsOf(exercise)}
                onAddSet={() => onAddSet(exercise.id)}
                onRemoveExtraSet={() => onRemoveExtraSet(exercise.id)}
              />

              <ExerciseInput exercise={exercise} onLog={handleLog} />
            </View>

            <ExerciseHeaderCard exercise={exercise} />

            <Divider />

            <ExerciseActionsList
              tips={tips}
              noteDraft={noteDraft}
              onOpenNote={() => setNoteModalOpen(true)}
              onSkip={() => {
                skipExercise(exercise.id);
                onJump(1);
              }}
              onAddExercise={() => setPicker('add')}
              onReplaceExercise={() => setPicker('replace')}
              onHideExercise={onHide}
              onFinish={() => confirmFinish(onFinish)}
            />
          </ScrollView>

          <FadeInCover />
        </MotiView>
      </AnimatePresence>

      <ExercisePickerSheet
        mode={picker}
        exercise={exercise}
        onClose={() => setPicker(null)}
      />

      <NoteModal
        visible={noteModalOpen}
        value={noteDraft}
        onChange={onNoteChange}
        onClose={() => setNoteModalOpen(false)}
      />
    </View>
  );
}

// «Завершить тренировку» или выйти без сохранения — с повторным вопросом.
function confirmFinish(onFinish: () => void) {
  Alert.alert('Тренировка', undefined, [
    { text: 'Завершить тренировку', onPress: onFinish },
    {
      text: 'Выйти без сохранения',
      style: 'destructive',
      onPress: () =>
        Alert.alert(
          'Выйти без сохранения?',
          'Все подходы этой тренировки будут потеряны.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Выйти', style: 'destructive', onPress: discardWorkout },
          ],
        ),
    },
    { text: 'Отмена', style: 'cancel' },
  ]);
}

function confirmHide(active: ActiveSession, exercise: Exercise) {
  const logged = active.logs.some(
    (l) => l.exerciseId === exercise.id && !l.skipped,
  );
  Alert.alert(
    'Скрыть упражнение?',
    [
      'Оно пропадёт из этой тренировки, а если вы добавляли его «каждый раз» — и из следующих.',
      logged ? 'Записанные подходы будут отменены.' : null,
    ]
      .filter(Boolean)
      .join(' '),
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Скрыть',
        style: 'destructive',
        onPress: () => hideExercise(exercise.id),
      },
    ],
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Background.primary,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
  },
  section: {
    justifyContent: 'flex-start',
    gap: spacing.md,
    padding: spacing.sm,
    backgroundColor: COLORS.Background.elevated,
    borderRadius: radius.lg,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
  },
});
