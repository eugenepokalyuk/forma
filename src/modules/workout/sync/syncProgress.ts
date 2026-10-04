import { create } from 'zustand';

// Ход текущей отправки очереди — для полоски прогресса. Только в памяти:
// после перезапуска отправка начинается заново.
interface SyncProgressState {
  // Идёт отправка (очередь не пуста и обработчик работает).
  active: boolean;
  // Сколько операций ушло и сколько всего в этом прогоне.
  sent: number;
  total: number;
}

export const useSyncProgress = create<SyncProgressState>(() => ({
  active: false,
  sent: 0,
  total: 0,
}));
