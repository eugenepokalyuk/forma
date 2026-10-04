import { Image } from 'expo-image';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  useExerciseCatalog,
  type Exercise,
  type ExerciseCatalogItem,
} from '@/modules/programs';
import {
  addExercise,
  formatMuscles,
  recommendedReplacements,
  replaceExercise,
  searchCatalog,
  useSessionStore,
} from '@/modules/workout';
import {
  BottomSheet,
  Icon,
  Input,
  ListGroup,
  ListRow,
  toast,
  Typography,
} from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';

export type ExercisePickerMode = 'add' | 'replace';

const NO_EXERCISES: Exercise[] = [];

interface CatalogSection {
  // null — без заголовка (результаты поиска, список для добавления).
  title: string | null;
  data: ExerciseCatalogItem[];
}

interface ExercisePickerSheetProps {
  mode: ExercisePickerMode | null;
  // Текущее упражнение на экране: его заменяем, после него добавляем.
  exercise: Exercise;
  onClose: () => void;
}

const TITLE: Record<ExercisePickerMode, string> = {
  add: 'Добавить упражнение',
  replace: 'Заменить упражнение',
};

// Выбор упражнения из каталога во время тренировки. Замена — сразу по
// нажатию (только на эту тренировку); добавление — со вторым шагом: разово
// или каждый раз в этой тренировке. Каталог — из кэша, работает без сети.
export function ExercisePickerSheet({
  mode,
  exercise,
  onClose,
}: ExercisePickerSheetProps) {
  const { height } = useWindowDimensions();
  const { data: catalog, isLoading } = useExerciseCatalog();
  const workoutExercises = useSessionStore(
    (s) => s.active?.workout.exercises ?? NO_EXERCISES,
  );
  const loggedSets = useSessionStore(
    (s) =>
      s.active?.logs.filter((l) => l.exerciseId === exercise.id && !l.skipped)
        .length ?? 0,
  );

  const [query, setQuery] = React.useState('');
  const [picked, setPicked] = React.useState<ExerciseCatalogItem | null>(null);

  // Шторка закрылась — в следующий раз начинаем с чистого поиска.
  const [lastMode, setLastMode] = React.useState(mode);
  if (lastMode !== mode) {
    setLastMode(mode);
    if (mode) {
      setQuery('');
      setPicked(null);
    }
  }

  const sections = React.useMemo((): CatalogSection[] => {
    if (!catalog || !mode) return [];
    // Упражнения, которые уже есть в тренировке, не предлагаем.
    const inWorkout = new Set(workoutExercises.map((e) => e.catalogExerciseId));
    const available = catalog.filter((c) => !inWorkout.has(c.id));
    const source = mode === 'replace' ? exercise : undefined;

    if (query.trim()) {
      return [{ title: null, data: searchCatalog(available, query, source) }];
    }

    if (mode === 'replace') {
      const recommended = recommendedReplacements(catalog, exercise).filter(
        (c) => !inWorkout.has(c.id),
      );
      const recIds = new Set(recommended.map((c) => c.id));
      return [
        { title: 'Похожие', data: recommended },
        {
          title: 'Все упражнения',
          data: searchCatalog(
            available.filter((c) => !recIds.has(c.id)),
            '',
            source,
          ),
        },
      ].filter((s) => s.data.length > 0);
    }

    return [{ title: null, data: searchCatalog(available, '') }];
  }, [catalog, mode, query, exercise, workoutExercises]);

  const onReplace = (item: ExerciseCatalogItem) => {
    const run = () => {
      replaceExercise(exercise.id, item);
      onClose();
      toast.show({ type: 'success', title: `Заменили на «${item.name}»` });
    };

    if (loggedSets === 0) {
      run();
      return;
    }
    Alert.alert(
      'Заменить упражнение?',
      'Записанные подходы этого упражнения будут отменены.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Заменить', style: 'destructive', onPress: run },
      ],
    );
  };

  const onAdd = (persist: boolean) => {
    if (!picked) return;
    addExercise(picked, persist);
    onClose();
    toast.show({
      type: 'success',
      title: `«${picked.name}» — следующее упражнение`,
    });
  };

  return (
    <BottomSheet
      visible={!!mode}
      title={mode ? TITLE[mode] : ''}
      onClose={onClose}
      maxHeight="90%"
    >
      {picked ? (
        <ScopeStep
          item={picked}
          onPick={onAdd}
          onBack={() => setPicked(null)}
        />
      ) : (
        <>
          <Input
            placeholder="Поиск упражнения"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            style={{ height: height * 0.55 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            stickySectionHeadersEnabled={false}
            initialNumToRender={12}
            renderSectionHeader={({ section }) =>
              section.title ? (
                <Typography
                  variant="label"
                  color={COLORS.Text.secondary}
                  style={styles.sectionTitle}
                >
                  {section.title}
                </Typography>
              ) : null
            }
            renderItem={({ item }) => (
              <CatalogRow
                item={item}
                onPress={() =>
                  mode === 'replace' ? onReplace(item) : setPicked(item)
                }
              />
            )}
            ListEmptyComponent={
              isLoading ? (
                <ActivityIndicator style={styles.empty} />
              ) : (
                <Typography
                  variant="body"
                  color={COLORS.Text.secondary}
                  align="center"
                  style={styles.empty}
                >
                  {catalog
                    ? 'Ничего не нашлось'
                    : 'Каталог упражнений загрузится, когда появится интернет'}
                </Typography>
              )
            }
          />
        </>
      )}
    </BottomSheet>
  );
}

// Без onPress — просто карточка упражнения (второй шаг добавления).
function CatalogRow({
  item,
  onPress,
}: {
  item: ExerciseCatalogItem;
  onPress?: () => void;
}) {
  const muscles = formatMuscles(item.muscles);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumb}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Icon name="dumbbell" size={20} color={COLORS.Icon.tertiary} />
        </View>
      )}

      <View style={styles.rowText}>
        <Typography variant="subtitle" numberOfLines={2}>
          {item.name}
        </Typography>

        {muscles ? (
          <Typography
            variant="label"
            color={COLORS.Text.secondary}
            numberOfLines={1}
          >
            {muscles}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  );
}

// Второй шаг добавления: что добавляем и как — разово или каждый раз.
// Нажатие на вариант сразу добавляет, без отдельной кнопки.
function ScopeStep({
  item,
  onPick,
  onBack,
}: {
  item: ExerciseCatalogItem;
  onPick: (persist: boolean) => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.scope}>
      <CatalogRow item={item} />

      <ListGroup>
        <ListRow
          icon="calendar-today"
          title="Только сегодня"
          subtitle="Упражнение будет только в этой тренировке"
          onPress={() => onPick(false)}
          isFirst
        />
        <ListRow
          icon="repeat"
          title="Каждый раз"
          subtitle="Будет и в следующих тренировках этого дня программы"
          onPress={() => onPick(true)}
          isLast
        />
      </ListGroup>

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        hitSlop={spacing.sm}
      >
        <Typography
          variant="subtitle"
          color={COLORS.Text.secondary}
          align="center"
        >
          {'Выбрать другое'}
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { paddingTop: spacing.md, paddingBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  rowPressed: { opacity: 0.6 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: COLORS.White,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.Surface.secondary,
  },
  rowText: { flex: 1, gap: 2 },
  empty: { paddingVertical: spacing.xl },
  scope: { gap: spacing.md, paddingBottom: spacing.sm },
});
