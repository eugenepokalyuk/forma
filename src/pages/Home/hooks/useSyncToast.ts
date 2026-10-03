import * as React from 'react';

import { useOutboxStore } from '@/modules/workout';
import { toast } from '@/shared/ui';

const TOAST_ID = 'sync';

// Несинхронизированные действия из очереди outbox — тостом поверх экрана,
// а не плашкой в раскладке: появление и исчезновение ничего не сдвигает.
export function useSyncToast() {
  const pending = useOutboxStore((s) => s.ops.length);
  const hadPending = React.useRef(false);

  React.useEffect(() => {
    if (pending > 0) {
      hadPending.current = true;
      toast.show({
        id: TOAST_ID,
        type: 'pending',
        title: `Не синхронизировано: ${pending}`,
      });
    } else if (hadPending.current) {
      hadPending.current = false;
      toast.show({
        id: TOAST_ID,
        type: 'success',
        title: 'Всё синхронизировано',
        duration: 2000,
      });
    }
  }, [pending]);

  // С главной ушли — висящий тост уходит вместе с ней.
  React.useEffect(() => () => toast.dismiss(TOAST_ID), []);
}
