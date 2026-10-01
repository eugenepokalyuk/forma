# auth — вход и текущий пользователь

- `services/session.ts` — `bootstrap()` (проверка токена при старте), `signIn()`, `signOut()`, `deleteAccount()`
- `hooks/useDeleteAccount` — удаление аккаунта с подтверждением (требование сторов)
- `hooks/useSignOut` — выход с предупреждением, если есть несинхронизированные тренировки
- `store.ts` — статус входа и текущий пользователь; 401 от API переводит в `signedOut`
- `queries.ts` — `useUpdateProfile`
- `helpers/onboarding.ts` — заполнен ли профиль
- `components/AppHeader` — шапка вкладок: логотип и бейдж ПРО для бесплатного тарифа

Вход/выход также привязывают и сбрасывают очередь тренировок (`adoptWorkoutData`, `resetWorkoutData` из `workout`).
