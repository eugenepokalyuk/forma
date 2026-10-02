import { requireOptionalNativeModule } from 'expo';
import type * as ExpoImageManipulator from 'expo-image-manipulator';

import type { PickedImage } from './pickImages';

// Как и пикер — только если модуль есть в сборке; без него фото уходит как есть.
const manipulator: typeof ExpoImageManipulator | null =
  requireOptionalNativeModule('ExpoImageManipulator')
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- импорт только при наличии нативного модуля
      require('expo-image-manipulator')
    : null;

// Сервер всё равно хранит фото не больше 1080px по большей стороне — крупнее
// нет смысла ни хранить на устройстве, ни гнать по сети.
const MAX_SIDE = 1080;
// WebP на 0.8 визуально не отличить от оригинала, а весит в разы меньше JPEG
// с камеры.
const QUALITY = 0.8;

// Уменьшает фото до MAX_SIDE и пересохраняет в WebP. Возвращает uri нового
// файла во временном кэше; если сжать не вышло — исходный uri.
export async function compressImage({
  uri,
  width,
  height,
}: PickedImage): Promise<string> {
  if (!manipulator) return uri;

  try {
    const context = manipulator.ImageManipulator.manipulate(uri);
    if (Math.max(width, height) > MAX_SIDE) {
      context.resize(
        width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE },
      );
    }
    const image = await context.renderAsync();
    const result = await image.saveAsync({
      format: manipulator.SaveFormat.WEBP,
      compress: QUALITY,
    });
    return result.uri;
  } catch {
    return uri;
  }
}
