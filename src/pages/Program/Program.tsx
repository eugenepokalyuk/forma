import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import * as React from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import type { WorkoutWithExercises } from '@/modules/programs';
import { WeekPill } from '@/pages/Program/components/WeekPill';
import { WorkoutListItem } from '@/pages/Program/components/WorkoutListItem';
import { Button, ErrorState, ScreenContainer, Typography } from '@/shared/ui';
import { COLORS, screenPadding, spacing } from '@/theme';
import { showProInfo, useAuthStore } from '@/modules/auth';
import {
  getProgramProgress,
  useSessions,
  useStartWorkout,
} from '@/modules/workout';
import {
  useAddUserProgram,
  useProgram,
  useRemoveUserProgram,
  useUserPrograms,
} from '@/modules/programs';
import { ProgramPreviewCard, ProgramReactions } from '@/modules/programs/ui';

// Насколько секция с описанием заходит на обложку снизу — как в каталоге.
const SHEET_OVERLAP = 20;

// Шапка прозрачная: обложка уходит под неё, остаётся только «назад».
const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
  headerStyle: { backgroundColor: 'transparent' },
};

export default function ProgramScreen() {
  const { id } = ExpoRouter.useLocalSearchParams<{ id: string }>();
  const insets = SafeArea.useSafeAreaInsets();
  const hasProAccess = useAuthStore((s) => s.user?.hasProAccess);
  const { data, isLoading, isError, refetch } = useProgram(id);
  const { data: userPrograms } = useUserPrograms();
  const { data: sessions } = useSessions();
  // null — пользователь ещё не выбирал: показываем неделю текущего дня.
  const [pickedWeek, setPickedWeek] = React.useState<number | null>(null);
  // undefined — ещё не трогали: раскрыт текущий день.
  const [expandedWorkoutId, setExpandedWorkoutId] = React.useState<
    string | null | undefined
  >(undefined);
  const weekScrollRef = React.useRef<ScrollView>(null);
  const didScrollToWeek = React.useRef(false);

  const userProgram = (userPrograms ?? []).find(
    (up) => up.programId === data?.id,
  );

  // Текущий и пройденные дни — та же логика, что «Сегодня» на главной.
  // У программы, которую не добавляли и не проходили, ничего не выделяем.
  const progress = React.useMemo(() => {
    if (!data) return null;
    const history = sessions ?? [];
    const touched =
      !!userProgram || history.some((s) => s.programId === data.id);
    if (!touched) return null;
    const ordered = [...data.workouts].sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );
    return getProgramProgress(ordered, history, data.id);
  }, [data, sessions, userProgram]);

  const startWorkout = useStartWorkout();
  const addMutation = useAddUserProgram(id);
  const removeMutation = useRemoveUserProgram();

  // Спиннер только при пустом кэше — данные из кэша показываются мгновенно,
  // обновление идёт в фоне.
  if (isLoading && !data) {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScreenContainer edges={[]} loading />
      </>
    );
  }

  if (!data) {
    return isError ? (
      <>
        <Stack.Screen options={{ title: '' }} />
        <ScreenContainer edges={[]}>
          <ErrorState onRetry={refetch} />
        </ScreenContainer>
      </>
    ) : null;
  }

  const isProLocked = data.tier === 'pro' && !hasProAccess;

  const current = progress?.current ?? null;
  const week =
    pickedWeek ?? current?.weekNumber ?? data.weeks[0]?.weekNumber ?? 1;
  const expandedId =
    expandedWorkoutId === undefined ? (current?.id ?? null) : expandedWorkoutId;

  const workoutsOfWeek = data.workouts.filter((w) => w.weekNumber === week);

  // Слайдер недель сам доезжает до недели текущего дня — один раз, при
  // первой раскладке, чтобы не дёргать его, когда пользователь листает.
  const onWeekLayout = (weekNumber: number, x: number) => {
    if (didScrollToWeek.current || weekNumber !== current?.weekNumber) return;
    didScrollToWeek.current = true;
    weekScrollRef.current?.scrollTo({
      x: Math.max(0, x - screenPadding),
      animated: false,
    });
  };

  const onStartWorkout = (workout: WorkoutWithExercises) =>
    startWorkout({ programId: data.id, workout });

  const onAdd = () => {
    if (isProLocked) {
      showProInfo();
      return;
    }
    addMutation.mutate();
  };

  const onRemove = () => {
    if (!userProgram) return;
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
  };

  const action = userProgram ? (
    <Button
      title="Отписаться от программы"
      variant="secondary"
      onPress={onRemove}
      loading={removeMutation.isPending}
    />
  ) : (
    <Button
      title="Выбрать программу"
      onPress={onAdd}
      loading={addMutation.isPending}
    />
  );

  const header = (
    <View>
      <View>
        <ProgramPreviewCard
          program={data}
          bottomOverlap={SHEET_OVERLAP}
          footer={action}
        />

        {/* «Назад», время и батарея читаются на фото. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0)']}
          style={[styles.topShade, { height: insets.top + 64 }]}
        />
      </View>

      {/* Всё ниже обложки — секция, которая заходит на неё снизу. */}
      <View style={styles.sheetTop} />

      <View style={styles.about}>
        {data.description ? (
          <Typography variant="body" color={COLORS.Text.primary}>
            {data.description}
          </Typography>
        ) : null}

        <ProgramReactions program={data} />
      </View>

      <ScrollView
        ref={weekScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekRow}
      >
        {data.weeks.map((w) => (
          <View
            key={w.weekNumber}
            onLayout={(e) => onWeekLayout(w.weekNumber, e.nativeEvent.layout.x)}
          >
            <WeekPill
              week={w}
              active={week === w.weekNumber}
              onPress={() => setPickedWeek(w.weekNumber)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <FlatList
        data={workoutsOfWeek}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        // Обложка — от самого верха экрана, под статус-баром и шапкой.
        contentInsetAdjustmentBehavior="never"
        ListHeaderComponent={header}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <WorkoutListItem
              workout={item}
              index={index}
              expanded={expandedId === item.id}
              isCurrent={current?.id === item.id}
              isDone={progress?.doneIds.has(item.id) ?? false}
              onToggle={() =>
                setExpandedWorkoutId(expandedId === item.id ? null : item.id)
              }
              onStartWorkout={onStartWorkout}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  sheetTop: {
    height: SHEET_OVERLAP,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: COLORS.Background.primary,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
  },
  about: {
    paddingHorizontal: screenPadding,
    gap: spacing.md,

    marginBottom: spacing.xl,
  },
  // Отступы — у содержимого, а не у самого ScrollView: иначе последняя
  // неделя прилипает к правому краю при прокрутке до конца.
  weekRow: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  listContent: { gap: spacing.sm },
  item: { paddingHorizontal: screenPadding },
});
