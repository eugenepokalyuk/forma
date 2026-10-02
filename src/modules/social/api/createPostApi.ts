import { apiRequest } from '@/shared/api/apiRequest';
import type { Post } from '../models/social';

// Фото с устройства — WebP после сжатия; JPEG, если сжать не вышло.
function mimeOf(uri: string) {
  return uri.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg';
}

export interface NewPost {
  sessionId: string;
  title: string;
  photoUris: string[];
}

// Метрики и упражнения пост берёт из сессии на бэке — шлём только ссылку на
// неё, подпись и фото. Бэк держит один пост на сессию: повтор вернёт уже
// созданный, поэтому запрос можно безопасно ретраить.
export function createPostApi({ sessionId, title, photoUris }: NewPost) {
  const data = new FormData();
  data.append('session_id', sessionId);
  data.append('title', title);
  photoUris.forEach((uri, i) =>
    // Файл в React Native — объект { uri, name, type }, а не Blob.
    data.append('photos', {
      uri,
      name: `photo-${i}.${mimeOf(uri).split('/')[1]}`,
      type: mimeOf(uri),
    } as unknown as Blob),
  );

  return apiRequest<Post>({
    method: 'post',
    url: '/social/feed',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
