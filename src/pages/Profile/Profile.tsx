import * as React from 'react';

import { ScreenContainer, ScreenHeader, useTabBarClearance } from '@/shared/ui';
import { AccountSection } from '@/pages/Profile/components/AccountSection';
import { IdentitySection } from '@/pages/Profile/components/IdentitySection';
import { LegalSection } from '@/pages/Profile/components/LegalSection';
import { SignOutSection } from '@/pages/Profile/components/SignOutSection';
import { StatsSection } from '@/pages/Profile/components/StatsSection';
import { useProfileStats } from '@/pages/Profile/hooks/useProfileStats';

export default function ProfileScreen() {
  const tabBarClearance = useTabBarClearance();
  const { isLoading, refetch } = useProfileStats();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScreenContainer
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <ScreenHeader title="Профиль" />
      <IdentitySection />
      <StatsSection />
      <AccountSection />
      <LegalSection />
      <SignOutSection />
    </ScreenContainer>
  );
}
