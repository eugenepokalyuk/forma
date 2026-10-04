import * as React from 'react';

// Сколько секунд прошло с начала тренировки — тикает раз в секунду.
export function useElapsedSeconds(startedAt: string | undefined) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!startedAt) return;

    const tick = () =>
      setElapsed(
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
      );

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}
