import { apiRequest } from '@/shared/api/apiRequest';
import { imageFileOf } from '@/shared/lib/media/imageMime';

export interface NewIdea {
  text: string;
  imageUri: string | null;
}

// Предложение из профиля — попадает в админку («Предложения»). Картинку бэк
// пересохраняет в WebP, так что формат файла с устройства не важен.
export function sendIdeaApi({ text, imageUri }: NewIdea) {
  const data = new FormData();
  data.append('text', text);
  if (imageUri) {
    const { type, ext } = imageFileOf(imageUri);
    // Файл в React Native — объект { uri, name, type }, а не Blob.
    data.append('image', {
      uri: imageUri,
      name: `idea.${ext}`,
      type,
    } as unknown as Blob);
  }

  return apiRequest({
    method: 'post',
    url: '/support/ideas',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
