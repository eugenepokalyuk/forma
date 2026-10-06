import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CatalogGender } from './models/program';
import { mmkvStorageAdapter } from '@/shared/lib/storage/mmkv';

interface CatalogState {
  gender: CatalogGender;
  setGender: (gender: CatalogGender) => void;
}

// Выбранная вкладка каталога «Мужская» / «Женская» — запоминается между запусками.
export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      gender: 'men',
      setGender: (gender) => set({ gender }),
    }),
    {
      name: 'forma.catalog',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    },
  ),
);
