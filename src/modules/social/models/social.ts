export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  hasProAccess: boolean;
}

export interface PublicUser {
  id: string; // public_id
  name: string;
  email: string;
  avatarUrl: string | null;
  isPublic: boolean;
  hasProAccess: boolean;
  followersCount: number;
  followingCount: number;
  isSelf: boolean;
  isFollowing: boolean;
  isRequested: boolean;
  // Текущий пользователь заблокировал этого.
  isBlocked?: boolean;
}

export interface FollowRequestItem {
  id: string;
  follower: PublicUser;
  createdAt: string;
}

export interface SocialSummary {
  pendingRequests: number;
}

export type FollowRequestAction = 'accept' | 'reject';

export interface PostExercise {
  name: string;
  thumbnailUrl: string | null;
  /** Каждый подход детально: ["40 кг × 12", "45 кг × 10"] или ["5 мин"]. */
  sets: string[];
}

export interface Comment {
  id: string;
  author: PostAuthor;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title: string;
  /** Первое фото (совместимость). Для карусели — photos. */
  photoUrl: string | null;
  photos: string[];
  durationSeconds: number;
  /** Тоннаж, кг (строка — DRF Decimal). */
  volumeKg: string;
  exercises: PostExercise[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

// Причины жалобы — совпадают с social.Report.REASON_CHOICES на бэкенде.
export type ReportReason = 'spam' | 'abuse' | 'nudity' | 'violence' | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Спам' },
  { value: 'abuse', label: 'Оскорбления или травля' },
  { value: 'nudity', label: 'Откровенный контент' },
  { value: 'violence', label: 'Насилие или опасные действия' },
  { value: 'other', label: 'Другое' },
];
