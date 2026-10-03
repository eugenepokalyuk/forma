import * as ReactQuery from '@tanstack/react-query';
import * as React from 'react';
import { View } from 'react-native';

import { AppHeader } from '@/modules/auth/ui';
import {
  AuroraBackground,
  ScreenContainer,
  useTabBarClearance,
} from '@/shared/ui';
import { BroSection } from '@/pages/Home/components/BroSection';
import { ProgramsSection } from '@/pages/Home/components/ProgramsSection';
import { WeekSection } from '@/pages/Home/components/WeekSection';
import { usePrefetchActivePrograms } from '@/pages/Home/hooks/usePrefetchActivePrograms';
import { useMyPrograms } from '@/pages/Home/hooks/useMyPrograms';
import { useSyncToast } from '@/pages/Home/hooks/useSyncToast';
import { programKeys } from '@/modules/programs';
import { workoutKeys } from '@/modules/workout';

// Насколько сияние за Бро выходит за рамки блока сверху и снизу.
const AURORA_SPILL = 120;

export default function HomeScreen() {
  const queryClient = ReactQuery.useQueryClient();
  const tabBarClearance = useTabBarClearance();
  const { data, isLoading } = useMyPrograms();

  usePrefetchActivePrograms(data);
  useSyncToast();

  // Сияние за Бро — первый слой контента экрана: выходит за рамки блока, но
  // лежит под всеми блоками (а не поверх соседних) и прокручивается с ним.
  const [broLayout, setBroLayout] = React.useState<{
    y: number;
    height: number;
  } | null>(null);

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
      header={<AppHeader />}
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      {broLayout ? (
        <AuroraBackground
          style={{
            top: broLayout.y - AURORA_SPILL,
            bottom: 'auto',
            height: broLayout.height + AURORA_SPILL * 2,
          }}
        />
      ) : null}

      <WeekSection />
      <View
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          setBroLayout({ y, height });
        }}
      >
        <BroSection />
      </View>
      <ProgramsSection />
    </ScreenContainer>
  );
}
