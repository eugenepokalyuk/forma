import * as React from 'react';

import {
  DEFAULT_TIMEZONE,
  getTimeOfDay,
  type TimeOfDay,
} from '@/shared/lib/date/timeOfDay';

const MINUTE = 60_000;

// Время суток пересчитывается раз в минуту и сразу — при смене часового пояса.
export function useTimeOfDay(timezone: string = DEFAULT_TIMEZONE): TimeOfDay {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), MINUTE);
    return () => clearInterval(id);
  }, []);

  return getTimeOfDay(timezone, now);
}
