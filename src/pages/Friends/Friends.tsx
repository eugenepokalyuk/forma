import { Stack } from 'expo-router';
import * as React from 'react';

import {
  FriendsTabs,
  type FriendsTab,
} from '@/pages/Friends/components/FriendsTabs';
import { PeopleListView } from '@/pages/Friends/components/views/PeopleListView';
import { RequestsListView } from '@/pages/Friends/components/views/RequestsListView';
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue';
import { Input, ScreenContainer } from '@/shared/ui';
import { spacing } from '@/theme';

// Поиск от двух символов заменяет вкладки результатами.
const MIN_QUERY = 2;

export default function FriendsScreen() {
  const [tab, setTab] = React.useState<FriendsTab>('following');
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const isSearching = debouncedQuery.length >= MIN_QUERY;

  return (
    <ScreenContainer
      edges={[]}
      contentStyle={{ gap: spacing.md, paddingHorizontal: spacing.sm }}
    >
      <Stack.Screen options={{ title: 'Друзья' }} />

      <Input
        placeholder="Поиск по имени или ID"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {isSearching ? (
        <PeopleListView source={{ kind: 'search', query: debouncedQuery }} />
      ) : (
        <>
          <FriendsTabs tab={tab} onChange={setTab} />

          {tab === 'requests' ? (
            <RequestsListView />
          ) : (
            <PeopleListView source={{ kind: tab }} />
          )}
        </>
      )}
    </ScreenContainer>
  );
}
