// Единый источник маршрутов — вместо «магических» строк-путей, разбросанных
// по router.push/Link/Redirect. Простые маршруты — константы, параметризованные
// (program/[id], workout/[id] и т.п.) — функции, возвращающие typed-route объект
// в формате, который ожидает expo-router (совместимо с experiments.typedRoutes).
export const ROUTES = {
  authEmail: '/(auth)/email',
  authCode: (email: string) => ({
    pathname: '/(auth)/code' as const,
    params: { email },
  }),

  home: '/(app)/(tabs)/home',
  feed: '/(app)/(tabs)/feed',
  catalog: '/(app)/(tabs)/catalog',
  profile: '/(app)/(tabs)/profile',

  program: (id: string) => ({
    pathname: '/(app)/program/[id]' as const,
    params: { id },
  }),
  workout: (id: string, programId: string) => ({
    pathname: '/(app)/workout/[id]' as const,
    params: { id, programId },
  }),
  friends: '/(app)/friends',

  sessionActive: '/session/active',
} as const;
