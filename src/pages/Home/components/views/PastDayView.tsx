import * as React from 'react';
import { View } from 'react-native';

import { sessionsOnDay, useSessions } from '@/modules/workout';
import { Section } from '@/shared/ui';
import { spacing } from '@/theme';
import { DayNoteCard } from '@/pages/Home/components/DayNoteCard';
import { SessionDayCard } from '@/pages/Home/components/SessionDayCard';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';

// Прошедший день: его тренировки — выполненные и брошенные на полпути.
export function PastDayView({ date }: { date: Date }) {
  const { data: sessions, isLoading } = useSessions();
  const { programs } = useMyPrograms();

  const daySessions = React.useMemo(
    () => sessionsOnDay(sessions ?? [], date),
    [sessions, date],
  );

  if (isLoading) return null;

  if (daySessions.length === 0) {
    return (
      <DayNoteCard
        title="Тренировки не было"
        message="В этот день вы отдыхали. Восстановление — тоже часть прогресса"
      />
    );
  }

  return (
    <Section padding>
      <View style={{ gap: spacing.md }}>
        {daySessions.map((session) => (
          <SessionDayCard
            key={session.id}
            session={session}
            programTitle={
              programs.find((up) => up.programId === session.programId)?.program
                .title ?? null
            }
          />
        ))}
      </View>
    </Section>
  );
}
