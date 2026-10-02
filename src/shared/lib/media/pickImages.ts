import { requireOptionalNativeModule } from 'expo';
import type * as ExpoImagePicker from 'expo-image-picker';

// expo-image-picker подключаем, только если он есть в сборке: в старой
// сборке без нативного модуля импорт уронил бы приложение (как стекло в ui/glass).
const picker: typeof ExpoImagePicker | null = requireOptionalNativeModule(
  'ExponentImagePicker',
)
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- импорт только при наличии нативного модуля
    require('expo-image-picker')
  : null;

export const canPickImages = picker !== null;

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

// Фото из галереи — локальные файлы с размерами. Пусто, если отменили выбор или модуля
// нет в сборке. Системный пикер (PHPicker / Photo Picker) не требует
// доступа ко всей галерее.
export async function pickImages(limit: number): Promise<PickedImage[]> {
  if (!picker || limit <= 0) return [];

  const result = await picker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    // Без сжатия: фото один раз ужимает compressImage — иначе качество
    // терялось бы дважды.
    quality: 1,
  });

  return result.canceled
    ? []
    : result.assets.map(({ uri, width, height }) => ({ uri, width, height }));
}
