import * as ExpoKeepAwake from 'expo-keep-awake';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import type { Exercise } from '@/modules/programs';
import { ExerciseActionsList } from '@/pages/Session/components/ExerciseActionsList';
import { ExerciseHeaderCard } from '@/pages/Session/components/ExerciseHeaderCard';
import { ExerciseInput } from '@/pages/Session/components/ExerciseInput';
import { ExerciseMediaCard } from '@/pages/Session/components/ExerciseMediaCard';
import { ExerciseProgressBar } from '@/pages/Session/components/ExerciseProgressBar';
import { NoteModal } from '@/pages/Session/components/NoteModal';
import { RestScreen } from '@/pages/Session/components/RestScreen';
import { SessionSummary } from '@/pages/Session/components/SessionSummary';
import { SetPills } from '@/pages/Session/components/SetPills';
import { Typography } from '@/shared/ui';
import { COLORS, motion, radius, screenPadding, spacing } from '@/theme';
import {
  discardWorkout,
  logSet,
  nextSetNumber,
  skipExercise,
  type LocalLog,
  useSessionStore,
} from '@/modules/workout';

type Phase = 'exercise' | 'rest' | 'summary';

function doneCountOf(exercise: Exercise, logs: LocalLog[]): number {
  return logs.filter((l) => l.exerciseId === exercise.id && !l.skipped).length;
}

function isExerciseSkipped(exercise: Exercise, logs: LocalLog[]): boolean {
  return logs.some((l) => l.exerciseId === exercise.id && l.skipped);
}

function isExerciseComplete(
  exercise: Exercise,
  logs: LocalLog[],
  totalSets: number,
): boolean {
  return (
    isExerciseSkipped(exercise, logs) ||
    doneCountOf(exercise, logs) >= totalSets
  );
}

export default function ActiveSessionScreen() {
  ExpoKeepAwake.useKeepAwake();
  const insets = SafeArea.useSafeAreaInsets();
  const active = useSessionStore((s) => s.active);
  const [view, setView] = React.useState<Phase>('exercise');
  const [elapsed, setElapsed] = React.useState(0);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  // Подходы, добавленные вручную сверх плана — по упражнению, живут в
  // пределах экрана тренировки (не персистятся, как и не персистится exercise.sets).
  const [extraSets, setExtraSets] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!active) return;

    const tick = () =>
      setElapsed(
        Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000),
      );

    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [active?.startedAt]);

  const exercises = active?.workout.exercises ?? [];
  const exercise = active ? exercises[active.currentExerciseIndex] : undefined;
  const isLast = active
    ? active.currentExerciseIndex === exercises.length - 1
    : false;
  const totalSets = exercise
    ? exercise.sets + (extraSets[exercise.id] ?? 0)
    : 0;

  // Заметка — черновик живёт, пока не переключились на другое упражнение.
  React.useEffect(() => {
    setNoteDraft('');
  }, [exercise?.id]);

  const jump = (delta: number) => {
    if (!active) return;
    const next = active.currentExerciseIndex + delta;

    if (next < 0) return;

    if (next >= exercises.length) {
      setView('summary');
      return;
    }

    useSessionStore.getState().goToExercise(next);
  };

  // Отдых — самостоятельный полноэкранный шаг. Когда он заканчивается (сам
  // или по «Пропустить»), решаем ПО ТЕКУЩЕМУ состоянию (не по запомненному
  // флагу): все подходы этого упражнения уже сделаны — идём дальше, иначе
  // возвращаемся к нему же на следующий подход.
  React.useEffect(() => {
    if (view !== 'rest' || !active || !exercise) return;

    if (active.restEndsAt) return;

    if (isExerciseComplete(exercise, active.logs, totalSets)) {
      if (isLast) setView('summary');
      else {
        useSessionStore
          .getState()
          .goToExercise(active.currentExerciseIndex + 1);
        setView('exercise');
      }
    } else {
      setView('exercise');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.restEndsAt, view]);

  // Защита от «фантомного» подхода сверх exercise.sets — например, если
  // вручную переключились назад на уже полностью выполненное упражнение.
  React.useEffect(() => {
    if (view !== 'exercise' || !active || !exercise) return;

    if (isExerciseComplete(exercise, active.logs, totalSets)) {
      jump(1);
    }
  }, [view, active?.currentExerciseIndex, exercise?.id]);

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

  const handleSkip = () => {
    skipExercise(exercise.id);
    jump(1);
  };

  if (view === 'summary') {
    return (
      <SessionSummary elapsed={elapsed} onBack={() => setView('exercise')} />
    );
  }

  if (view === 'rest') {
    const complete = isExerciseComplete(exercise, active.logs, totalSets);
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
      />
    );
  }

  const tips =
    [exercise.notes, exercise.additionalInfo].filter(Boolean).join('\n\n') ||
    null;

  const onAddExercise = () => {
    Alert.alert(
      'Скоро',
      'Добавление своего упражнения в тренировку появится в одном из следующих обновлений',
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Typography variant="title" color={COLORS.Text.primary}>
          {active.currentExerciseIndex + 1}/{exercises.length}
        </Typography>

        <Pressable onPress={onAddExercise} hitSlop={8}>
          <Typography variant="title" color={COLORS.Text.secondary}>
            {'ДОБАВИТЬ'}
          </Typography>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable onPress={onFinishMenu} hitSlop={8}>
          <Typography variant="title" color={COLORS.Text.secondary}>
            {'ЗАВЕРШИТЬ'}
          </Typography>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: screenPadding }}>
        <ExerciseProgressBar
          total={exercises.length}
          index={active.currentExerciseIndex}
          onPressSegment={(i) => useSessionStore.getState().goToExercise(i)}
        />
      </View>

      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={exercise.id}
          from={{ opacity: 0, translateX: 24 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -24 }}
          transition={motion.springSoft}
          style={styles.body}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
              onFinish={onFinishMenu}
            />
          </ScrollView>
        </MotiView>
      </AnimatePresence>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  section: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: COLORS.Background.elevated,
    borderRadius: radius.lg,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.Stroke.hairline,
  },
});
