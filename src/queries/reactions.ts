import * as ReactQuery from '@tanstack/react-query';

import { getReactionsApi } from '@/api';
import { queryKeys } from '@/queries/keys';

// Справочник реакций не меняется за время жизни приложения.
export function useReactions() {
  return ReactQuery.useQuery({
    queryKey: queryKeys.reactions,
    queryFn: getReactionsApi,
    staleTime: Infinity,
  });
}
