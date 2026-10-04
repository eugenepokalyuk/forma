import * as ExpoKeepAwake from 'expo-keep-awake';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import type { Exercise } from '@/modules/programs';
import { ExerciseActionsList } from '@/pages/Session/components/ExerciseActionsList';
import { ExerciseHeaderCard } from '@/pages/Session/components/ExerciseHeaderCard';
import { ExerciseInput } from '@/pages/Session/components/ExerciseInput';
import { ExerciseMediaCard } from '@/pages/Session/components/ExerciseMediaCard';
import {
  ExercisePickerSheet,
  type ExercisePickerMode,
} from '@/pages/Session/components/ExercisePickerSheet';
import { ExerciseProgressBar } from '@/pages/Session/components/ExerciseProgressBar';
import { FinishFlow } from '@/pages/Session/components/FinishFlow';
import { NoteModal } from '@/pages/Session/components/NoteModal';
import { RestScreen } from '@/pages/Session/components/RestScreen';
import { SetPills } from '@/pages/Session/components/SetPills';
import { useRestEndSound } from '@/pages/Session/hooks/useRestEndSound';
import { FadeInCover, Typography } from '@/shared/ui';
import { COLORS, motion, radius, screenPadding, spacing } from '@/theme';
import {
  discardWorkout,
  hideExercise,
  isExerciseDone,
  isExerciseFinished,
  isExerciseSkipped,
  stepAfterRest,
  stepToExercise,
  type WorkoutStep,
  logSet,
  nextSetNumber,
  skipExercise,
  useSessionStore,
} from '@/modules/workout';

type Phase = 'exercise' | 'rest' | 'summary';

export default function ActiveSessionScreen() {
  ExpoKeepAwake.useKeepAwake();
  const insets = SafeArea.useSafeAreaInsets();
  const active = useSessionStore((s) => s.active);
  const playRestEndSound = useRestEndSound();
  // После перезапуска приложения посреди отдыха возвращаемся в отдых —
  // истёкший таймер сразу завершит его и переведёт дальше (см. finishRest).
  const [view, setView] = React.useState<Phase>(() =>
    useSessionStore.getState().active?.restEndsAt ? 'rest' : 'exercise',
  );
  const [elapsed, setElapsed] = React.useState(0);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [picker, setPicker] = React.useState<ExercisePickerMode | null>(null);
  // Подходы, добавленные вручную сверх плана — по упражнению, живут в
  // пределах экрана тренировки (не персистятся, как и не персистится exercise.sets).
  const [extraSets, setExtraSets] = React.useState<Record<string, number>>({});

  const startedAt = active?.startedAt;
  React.useEffect(() => {
    if (!startedAt) return;

    const tick = () =>
      setElapsed(
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      );

    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [startedAt]);

  const exercises = active?.workout.exercises ?? [];
  const exercise = active ? exercises[active.currentExerciseIndex] : undefined;
  const isLast = active
    ? active.currentExerciseIndex === exercises.length - 1
    : false;
  const totalSets = exercise
    ? exercise.sets + (extraSets[exercise.id] ?? 0)
    : 0;

  // Заметка — черновик живёт, пока не переключились на другое упражнение.
  const [noteExerciseId, setNoteExerciseId] = React.useState(exercise?.id);
  if (noteExerciseId !== exercise?.id) {
    setNoteExerciseId(exercise?.id);
    setNoteDraft('');
  }

  const totalSetsOf = (ex: Exercise) => ex.sets + (extraSets[ex.id] ?? 0);

  // Применяет шаг: перейти к упражнению или открыть итог. Состояние берём
  // из стора, а не из рендера: зовётся сразу после записи в стор.
  const goTo = (step: WorkoutStep) => {
    if (step.kind === 'summary') {
      setView('summary');
      return;
    }
    useSessionStore.getState().goToExercise(step.index);
    setView('exercise');
  };

  const navigate = (index: number) => {
    const current = useSessionStore.getState().active;
    if (!current || index < 0) return;
    goTo(
      stepToExercise(
        current.workout.exercises,
        current.logs,
        index,
        totalSetsOf,
      ),
    );
  };

  const jump = (delta: number) => {
    const current = useSessionStore.getState().active;
    if (current) navigate(current.currentExerciseIndex + delta);
  };

  // Отдых — самостоятельный полноэкранный шаг. Когда он заканчивается (сам
  // или по «Пропустить»), решаем по текущему состоянию: все подходы этого
  // упражнения сделаны — идём дальше, иначе возвращаемся к нему же на
  // следующий подход.
  const finishRest = (options?: { sound?: boolean }) => {
    if (options?.sound) playRestEndSound();
    useSessionStore.getState().clearRest();
    const current = useSessionStore.getState().active;
    if (!current) return;

    goTo(
      stepAfterRest(
        current.workout.exercises,
        current.logs,
        current.currentExerciseIndex,
        totalSetsOf,
      ),
    );
  };

  if (!active || !exercise) return null;

  const onFinishMenu = () => {
    Alert.alert('Тренировка', undefined, [
      { text: 'Завершить тренировку', onPress: () => setView('summary') },
      {
        text: 'Выйти без сохранения',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Выйти без сохранения?',
            'Все подходы этой тренировки будут потеряны.',
            [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Выйти',
                style: 'destructive',
                onPress: discardWorkout,
              },
            ],
          ),
      },
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

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
    setNoteDraft('');
    setView('rest');
  };

  // Скрыть своё упражнение — разовое или «каждый раз». Последнее упражнение
  // тренировки не скрываем.
  const onHide =
    exercise.isCustom && exercises.length > 1
      ? () => {
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
      : undefined;

  const handleSkip = () => {
    skipExercise(exercise.id);
    jump(1);
  };

  if (view === 'summary') {
    return <FinishFlow elapsed={elapsed} onBack={() => setView('exercise')} />;
  }

  if (view === 'rest') {
    const complete = isExerciseFinished(exercise, active.logs, totalSets);
    const goingToNext = complete && !isLast;
    const nextExercise = goingToNext
      ? exercises[active.currentExerciseIndex + 1]
      : exercise;
    const nextLabel = goingToNext
      ? nextExercise.name
      : complete
        ? 'Итог тренировки'
        : `${exercise.name} · подход ${nextSetNumber(exercise.id, active.logs)} из ${totalSets}`;

    return (
      <RestScreen
        nextLabel={nextLabel}
        nextThumbnailUrl={nextExercise.thumbnailUrl}
        onDone={finishRest}
      />
    );
  }

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
          color={COLORS.Text.primary}
          accessibilityLabel={`Упражнение ${active.currentExerciseIndex + 1} из ${exercises.length}`}
        >
          {active.currentExerciseIndex + 1}/{exercises.length}
        </Typography>
      </View>

      <View style={{ paddingHorizontal: screenPadding }}>
        <ExerciseProgressBar
          states={exercises.map((ex, i) =>
            i === active.currentExerciseIndex
              ? 'current'
              : isExerciseDone(ex, active.logs, totalSetsOf(ex))
                ? 'done'
                : isExerciseSkipped(ex, active.logs)
                  ? 'skipped'
                  : 'pending',
          )}
          onPressSegment={navigate}
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
                totalSets={totalSets}
                onAddSet={() =>
                  setExtraSets((prev) => ({
                    ...prev,
                    [exercise.id]: (prev[exercise.id] ?? 0) + 1,
                  }))
                }
                onRemoveExtraSet={() =>
                  setExtraSets((prev) => ({
                    ...prev,
                    [exercise.id]: Math.max(0, (prev[exercise.id] ?? 0) - 1),
                  }))
                }
              />

              <ExerciseInput exercise={exercise} onLog={handleLog} />
            </View>

            <ExerciseHeaderCard exercise={exercise} />

            <View style={styles.divider} />

            <ExerciseActionsList
              tips={tips}
              noteDraft={noteDraft}
              onOpenNote={() => setNoteModalOpen(true)}
              onSkip={handleSkip}
              onAddExercise={() => setPicker('add')}
              onReplaceExercise={() => setPicker('replace')}
              onHideExercise={onHide}
              onFinish={onFinishMenu}
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
        onChange={setNoteDraft}
        onClose={() => setNoteModalOpen(false)}
      />
    </View>
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
    display: 'flex',
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.Stroke.hairline,
  },
});
