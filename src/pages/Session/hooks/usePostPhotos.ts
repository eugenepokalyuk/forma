import * as React from 'react';

import { compressImage } from '@/shared/lib/media/compressImage';
import { canPickImages, pickImages } from '@/shared/lib/media/pickImages';

// Столько же, сколько принимает бэк (MAX_POST_PHOTOS).
export const MAX_POST_PHOTOS = 6;

// Фото к посту — локальные uri из галереи, не больше MAX_POST_PHOTOS.
// Сжимаем сразу при выборе: и превью, и очередь, и загрузка — с лёгким файлом.
export function usePostPhotos() {
  const [uris, setUris] = React.useState<string[]>([]);

  const add = async () => {
    const picked = await pickImages(MAX_POST_PHOTOS - uris.length);
    if (picked.length === 0) return;
    const compressed = await Promise.all(picked.map(compressImage));
    setUris((prev) => [...prev, ...compressed].slice(0, MAX_POST_PHOTOS));
  };

  const remove = (uri: string) =>
    setUris((prev) => prev.filter((u) => u !== uri));

  return {
    uris,
    add,
    remove,
    canAdd: canPickImages && uris.length < MAX_POST_PHOTOS,
  };
}
