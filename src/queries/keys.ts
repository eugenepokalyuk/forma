// Все ключи кэша react-query в одном месте: инвалидация и чтение кэша
// ссылаются на них, а не на строковые литералы по месту.
// Значения не менять без нужды — кэш персистится в MMKV между запусками.
export const queryKeys = {
  sessions: ['sessions'] as const,
  userPrograms: ['userPrograms'] as const,
  program: (id: string | undefined) => ['program', id] as const,
  catalog: ['catalog'] as const,
  reactions: ['reactions'] as const,
  feed: ['feed'] as const,
  comments: (postId: string | null) => ['comments', postId] as const,
  social: {
    all: ['social'] as const,
    search: (q: string) => ['social', 'search', q] as const,
    following: ['social', 'following'] as const,
    followers: ['social', 'followers'] as const,
    requests: ['social', 'requests'] as const,
    summary: ['social', 'summary'] as const,
  },
  broPhrases: ['broPhrases'] as const,
  stats: ['stats'] as const,
  waterToday: ['water', 'today'] as const,
  achievements: ['achievements'] as const,
};
