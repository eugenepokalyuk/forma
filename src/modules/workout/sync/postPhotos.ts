import { Directory, File, Paths } from 'expo-file-system';

import { uuid } from '@/shared/lib/uuid';

// Фото постов, ждущих отправки. Пикер отдаёт файлы во временном кэше —
// система может очистить его раньше, чем появится сеть, поэтому копируем
// их в документы приложения и удаляем, когда в очереди они больше не нужны.
function photosDir() {
  return new Directory(Paths.document, 'outbox-photos');
}

// Копии фото для очереди. Фото, которое не удалось скопировать (файл уже
// пропал), пропускаем — пост уйдёт без него.
export function keepPhotos(uris: string[]): string[] {
  if (uris.length === 0) return [];

  const dir = photosDir();
  dir.create({ intermediates: true, idempotent: true });

  return uris.flatMap((uri) => {
    try {
      const source = new File(uri);
      const copy = new File(dir, `${uuid()}${source.extension || '.jpg'}`);
      source.copy(copy);
      return [copy.uri];
    } catch {
      return [];
    }
  });
}

// Только существующие файлы — пропавшее фото не должно вечно вешать
// отправку поста.
export function existingPhotos(uris: string[]): string[] {
  return uris.filter((uri) => new File(uri).exists);
}

// Удаляет копии, на которые не ссылается ни одна операция: пост отправлен,
// отклонён или очередь сброшена.
// Уборка не должна ломать отправку — ошибки файловой системы глотаем,
// оставшееся удалится при следующем проходе.
export function sweepPhotos(inUse: string[]) {
  try {
    const dir = photosDir();
    if (!dir.exists) return;

    const keep = new Set(inUse);
    for (const entry of dir.list()) {
      if (!keep.has(entry.uri)) entry.delete();
    }
  } catch {
    // см. выше
  }
}
