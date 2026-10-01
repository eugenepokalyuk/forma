import * as React from 'react';

import {
  DEFAULT_TIMEZONE,
  getTimeOfDay,
  type TimeOfDay,
} from '@/shared/lib/date/timeOfDay';

const MINUTE = 60_000;

export function useTimeOfDay(timezone: string = DEFAULT_TIMEZONE): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = React.useState<TimeOfDay>(() =>
    getTimeOfDay(timezone),
  );

  React.useEffect(() => {
    setTimeOfDay(getTimeOfDay(timezone));
    const id = setInterval(() => setTimeOfDay(getTimeOfDay(timezone)), MINUTE);
    return () => clearInterval(id);
  }, [timezone]);

  return timeOfDay;
}
