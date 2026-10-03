import * as React from 'react';

import { ScreenContainer, useTabBarClearance } from '@/shared/ui';
import { AccountSection } from '@/pages/Profile/components/AccountSection';
import { IdentitySection } from '@/pages/Profile/components/IdentitySection';
import { LegalSection } from '@/pages/Profile/components/LegalSection';
import { SignOutSection } from '@/pages/Profile/components/SignOutSection';
import { StatsSection } from '@/pages/Profile/components/StatsSection';
import { useProfileStats } from '@/pages/Profile/hooks/useProfileStats';
import { AppHeader } from '@/modules/auth/components/AppHeader';

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
      header={<AppHeader />}
      edges={['top']}
      loading={isLoading}
      scroll
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentStyle={{ paddingBottom: tabBarClearance }}
    >
      <IdentitySection />
      <StatsSection />
      <AccountSection />
      <LegalSection />
      <SignOutSection />
    </ScreenContainer>
  );
}
