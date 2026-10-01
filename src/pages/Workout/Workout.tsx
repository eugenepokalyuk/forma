import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import * as ExpoRouter from 'expo-router';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/shared/ui';
import { Card } from '@/shared/ui';
import { FadeInItem } from '@/shared/ui';
import { Typography } from '@/shared/ui';
import { COLORS, radius, spacing } from '@/theme';
import { formatSetsLine } from '@/modules/workout';
import { ROUTES } from '@/shared/constants/routes';
import { useSessionStore } from '@/modules/workout';
import { useCachedProgram } from '@/modules/programs';
import { loadLastLogs } from '@/modules/workout';

export default function WorkoutScreen() {
  const { id, programId } = ExpoRouter.useLocalSearchParams<{
    id: string;
    programId: string;
  }>();
  const active = useSessionStore((s) => s.active);
  const start = useSessionStore((s) => s.start);
  const completeSession = useSessionStore((s) => s.completeSession);

  const program = useCachedProgram(programId);
  const workout = program?.workouts.find((w) => w.id === id);

  if (!program || !workout) return null;

  const beginWorkout = () => {
    start({ programId: program.id, workoutId: workout.id, workout });
    router.replace(ROUTES.sessionActive);
    loadLastLogs(workout);
  };

  const onStart = () => {
    if (active) {
      Alert.alert('Завершить текущую и начать новую?', undefined, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить и начать',
          style: 'destructive',
          onPress: () => {
            completeSession();
            beginWorkout();
          },
        },
      ]);
      return;
    }
    beginWorkout();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: workout.name }} />

      <FlatList
        data={workout.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          gap: spacing.sm,
          paddingBottom: 110,
        }}
        ListHeaderComponent={
          <Typography
            variant="label"
            color={COLORS.Text.secondary}
            style={styles.listHeader}
          >
            {workout.exercises.length} УПРАЖНЕНИЙ
          </Typography>
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={index}>
            <Card>
              <View style={styles.row}>
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.thumb}
                  />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Typography variant="heading" color={COLORS.Text.tertiary}>
                      {item.name.charAt(0).toUpperCase()}
                    </Typography>
                  </View>
                )}
                <View style={styles.rowText}>
                  <Typography variant="title">{item.name}</Typography>

                  <Typography variant="body" color={COLORS.Text.secondary}>
                    {formatSetsLine(item)}
                  </Typography>

                  {item.notes ? (
                    <Typography
                      variant="body"
                      color={COLORS.Text.tertiary}
                      style={styles.exerciseNotes}
                    >
                      {item.notes}
                    </Typography>
                  ) : null}
                </View>
              </View>
            </Card>
          </FadeInItem>
        )}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0)', COLORS.Background.primary]}
        style={styles.footerFade}
        pointerEvents="none"
      />
      <View style={styles.footer}>
        <Button title="Начать тренировку" onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Background.primary },
  listHeader: { marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: COLORS.Surface.secondary,
    borderWidth: 1,
    borderColor: COLORS.Stroke.hairline,
    overflow: 'hidden',
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  exerciseNotes: { fontSize: 13, fontStyle: 'italic' },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 84,
    height: 40,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: COLORS.Background.primary,
  },
});
