import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';

import { AppHeader } from '@/components/AppHeader';
import { useTabBarClearance } from '@/components/TabBar';
import { ScreenContainer } from '@/components/ui';
import { BroSection } from '@/pages/Home/components/BroSection';
import { ProgramsSection } from '@/pages/Home/components/ProgramsSection';
import { SyncBanner } from '@/pages/Home/components/SyncBanner';
import { WeekSection } from '@/pages/Home/components/WeekSection';
import { usePrefetchActivePrograms } from '@/pages/Home/hooks/usePrefetchActivePrograms';
import { useUserPrograms } from '@/pages/Home/hooks/useUserPrograms';

export default function HomeScreen() {
  const queryClient = ReactQuery.useQueryClient();
  const tabBarClearance = useTabBarClearance();
  const { data, isLoading } = useUserPrograms();

  usePrefetchActivePrograms(data);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['userPrograms'] }),
        queryClient.refetchQueries({ queryKey: ['sessions'] }),
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
