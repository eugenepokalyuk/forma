const MIME_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  gif: 'image/gif',
};

// MIME и расширение файла из галереи для multipart. После compressImage это
// WebP; если сжать не вышло — исходный формат, по умолчанию JPEG.
export function imageFileOf(uri: string) {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const type = MIME_BY_EXT[ext] ?? 'image/jpeg';
  return { type, ext: type === 'image/jpeg' ? 'jpg' : ext };
}
