import { apiRequest } from '@/shared/api/apiRequest';
import { imageFileOf } from '@/shared/lib/media/imageMime';
import type { Post } from '../models/social';

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
  photoUris.forEach((uri, i) => {
    const { type, ext } = imageFileOf(uri);
    // Файл в React Native — объект { uri, name, type }, а не Blob.
    data.append('photos', {
      uri,
      name: `photo-${i}.${ext}`,
      type,
    } as unknown as Blob);
  });

  return apiRequest<Post>({
    method: 'post',
    url: '/social/feed',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
