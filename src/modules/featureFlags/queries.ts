import * as ReactQuery from '@tanstack/react-query';

import { getFeatureFlagsApi } from './api/getFeatureFlagsApi';
import type { FeatureFlag, FeatureFlagKey } from './models/featureFlag';

// Значения ключей не менять без нужды — кэш персистится в MMKV между запусками.
export const featureFlagKeys = {
  all: ['featureFlags'] as const,
};

// Флаг из админки. Пока флаги не загружены (и флага нет в ответе) — выключен:
// без сети работает последнее значение из кэша на устройстве.
export function useFeatureFlag(key: FeatureFlagKey) {
  const { data } = ReactQuery.useQuery({
    queryKey: featureFlagKeys.all,
    queryFn: getFeatureFlagsApi,
    select: (flags: FeatureFlag[]) =>
      flags.some((f) => f.key === key && f.enabled),
  });
  return data ?? false;
}
