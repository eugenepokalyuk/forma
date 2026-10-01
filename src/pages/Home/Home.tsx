import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import { AppHeader } from '@/modules/auth';
import { useTabBarClearance } from '@/shared/ui';
import { ScreenContainer } from '@/shared/ui';
import { BroSection } from '@/pages/Home/components/BroSection';
import { ProgramsSection } from '@/pages/Home/components/ProgramsSection';
import { SyncBanner } from '@/pages/Home/components/SyncBanner';
import { WeekSection } from '@/pages/Home/components/WeekSection';
import { usePrefetchActivePrograms } from '@/pages/Home/hooks/usePrefetchActivePrograms';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';
import { programKeys } from '@/modules/programs';
import { workoutKeys } from '@/modules/workout';

export default function HomeScreen() {
  const queryClient = ReactQuery.useQueryClient();
  const tabBarClearance = useTabBarClearance();
  const { data, isLoading } = useMyPrograms();

  usePrefetchActivePrograms(data);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: programKeys.userPrograms }),
        queryClient.refetchQueries({ queryKey: workoutKeys.sessions }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <AppHeader />
      <SyncBanner />
      <WeekSection />
      <BroSection />
      <ProgramsSection />
    </ScreenContainer>
  );
}
