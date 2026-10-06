# Forma

Мобильное приложение Forma — тренировки по программам с офлайн-режимом, лента и друзья.
Бэкенд и сайт — в соседнем репозитории `forma-project` (`forma-python`, `forma-next`).

**Стек:** Expo 57 · React Native 0.86 · expo-router · TypeScript · react-query (серверные данные) · zustand (данные на устройстве) · MMKV · jest

## Запуск

```bash
npm install
cp .env.example .env   # по умолчанию — прод API; для локального бэкенда укажи LAN-IP
npm run ios            # или npm run android — dev-сборка на симуляторе/устройстве
npm start              # только Metro, если dev-клиент уже установлен
```

## Команды

| Команда                           | Что делает                                                                  |
| --------------------------------- | --------------------------------------------------------------------------- |
| `npm test`                        | тесты (jest)                                                                |
| `npm run typecheck`               | проверка типов                                                              |
| `npm run lint`                    | ESLint (`eslint-config-expo`, правила React Compiler)                       |
| `npm run format` / `format:check` | prettier                                                                    |
| `eas build --profile preview`     | внутренняя сборка (Android — apk)                                           |
| `eas build --profile production`  | сборка в сторы                                                              |
| `npm run build:apk` / `build:aab` | локальная release-сборка Android (apk — на устройство, aab — в Google Play) |
| `npm run build:ios`               | локальная сборка на подключённый iPhone                                     |

Локальные `build:apk` и `build:aab` перед сборкой удаляют манифест ассетов `expo-updates`: Gradle
сам его не пересобирает, и новые картинки из `assets/` на Android оставались без адреса.
Новая нативная зависимость (например, `react-native-keyboard-controller`) требует пересборки
приложения и `pod install` — по OTA она не доезжает.

Те же проверки — типы, линтер, тесты, prettier — запускает CI на каждый push в `main` и pull request (`.github/workflows/ci.yml`).

## Устройство кода

Общая схема и правила — [src/README.md](src/README.md).

| Папка                                | Что там                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| [src/app](src/app/README.md)         | маршруты expo-router — только реэкспорт экранов         |
| [src/pages](src/pages/README.md)     | экраны и их локальные компоненты                        |
| [src/modules](src/modules/README.md) | доменная логика: api, кэш, сторы, сценарии              |
| [src/shared](src/shared/README.md)   | общее без доменов: HTTP-клиент, дизайн-система, утилиты |
| [src/theme](src/theme/README.md)     | цвета, отступы, типографика                             |

Модули:
[auth](src/modules/auth/README.md) ·
[programs](src/modules/programs/README.md) ·
[workout](src/modules/workout/README.md) ·
[social](src/modules/social/README.md) ·
[bro](src/modules/bro/README.md) ·
[featureFlags](src/modules/featureFlags/README.md)

## Офлайн

Тренировка целиком работает без сети: подходы, замена, добавление и скрытие упражнений
пишутся на устройство и уходят на сервер из очереди синхронизации, когда появляется связь
(каталог упражнений для замены — в кэше на устройстве). Данные с сервера (профиль, лента,
каталог) без сети берутся из кэша и сами перезапрашиваются, когда связь вернулась. Подробнее — [modules/workout](src/modules/workout/README.md).
