import * as React from 'react';

import { ScreenContainer, useTabBarClearance } from '@/shared/ui';
import { GuestSection } from '@/pages/Profile/components/GuestSection';
import { AccountSection } from '@/pages/Profile/components/AccountSection';
import { IdentitySection } from '@/pages/Profile/components/IdentitySection';
import { LegalSection } from '@/pages/Profile/components/LegalSection';
import { SignOutSection } from '@/pages/Profile/components/SignOutSection';
import { StatsSection } from '@/pages/Profile/components/StatsSection';
import { useProfileStats } from '@/pages/Profile/hooks/useProfileStats';
import { AppHeader } from '@/modules/auth/components/AppHeader';
import { useRefresh } from '@/shared/lib/hooks/useRefresh';

export default function ProfileScreen() {
  const tabBarClearance = useTabBarClearance();
  const { isLoading, refetch } = useProfileStats();

  const { isRefreshing, onRefresh } = useRefresh(refetch);

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
      <GuestSection />
      <StatsSection />
      <AccountSection />
      <LegalSection />
      <SignOutSection />
    </ScreenContainer>
  );
}
