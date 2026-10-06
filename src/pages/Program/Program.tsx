import { Stack } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import * as React from 'react';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import * as SafeArea from 'react-native-safe-area-context';

import { ProgramAction } from '@/pages/Program/components/ProgramAction';
import { WeekSlider } from '@/pages/Program/components/WeekSlider';
import { WorkoutListItem } from '@/pages/Program/components/WorkoutListItem';
import { useProgramProgress } from '@/pages/Program/hooks/useProgramProgress';
import { ErrorState, ScreenContainer, Typography } from '@/shared/ui';
import { COLORS, screenPadding, spacing } from '@/theme';
import { useStartWorkout } from '@/modules/workout';
import { useProgram } from '@/modules/programs';
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
  const { data, isLoading, isError, refetch } = useProgram(id);
  const progress = useProgramProgress(data);
  const startWorkout = useStartWorkout();
  // null — пользователь ещё не выбирал: показываем неделю текущего дня.
  const [pickedWeek, setPickedWeek] = React.useState<number | null>(null);
  // undefined — ещё не трогали: раскрыт текущий день.
  const [expandedWorkoutId, setExpandedWorkoutId] = React.useState<
    string | null | undefined
  >(undefined);
  // Прокрутка списка — для параллакса обложки.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

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

  const current = progress?.current ?? null;
  const week =
    pickedWeek ?? current?.weekNumber ?? data.weeks[0]?.weekNumber ?? 1;
  const expandedId =
    expandedWorkoutId === undefined ? (current?.id ?? null) : expandedWorkoutId;

  // Запуск из «Начать тренировку» после добавления программы: текущий по
  // плану день, у новой программы — первый.
  const startCurrentWorkout = () => {
    const workout =
      current ??
      [...data.workouts].sort((a, b) => a.dayNumber - b.dayNumber)[0];
    if (workout) startWorkout({ programId: data.id, workout });
  };

  const header = (
    <View>
      <ProgramPreviewCard
        program={data}
        bottomOverlap={SHEET_OVERLAP}
        scrollY={scrollY}
        // «Назад», время и батарея читаются на фото.
        topShadeHeight={insets.top + 64}
        footer={
          <ProgramAction program={data} onStartWorkout={startCurrentWorkout} />
        }
      />

      {/* Всё ниже обложки — секция, которая заходит на неё снизу. */}
      <View style={styles.sheetTop} />

      <View style={styles.about}>
        {data.description ? (
          <Typography variant="body">{data.description}</Typography>
        ) : null}

        <ProgramReactions program={data} />
      </View>

      <WeekSlider
        weeks={data.weeks}
        selected={week}
        currentWeek={current?.weekNumber}
        onSelect={setPickedWeek}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <Animated.FlatList
        data={data.workouts.filter((w) => w.weekNumber === week)}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
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
              onStartWorkout={(workout) =>
                startWorkout({ programId: data.id, workout })
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
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
  listContent: { gap: spacing.sm },
  item: { paddingHorizontal: screenPadding },
});
