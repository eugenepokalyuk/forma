import * as React from 'react';

// Значение, которое обновляется только после паузы в delay мс — например,
// поиск не шлёт запрос на каждый набранный символ.
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
