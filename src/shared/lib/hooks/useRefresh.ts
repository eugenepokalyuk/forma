import * as React from 'react';

// Pull-to-refresh: крутилка горит, пока идёт перезагрузка данных экрана.
export function useRefresh(refresh: () => Promise<unknown>) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, onRefresh };
}
