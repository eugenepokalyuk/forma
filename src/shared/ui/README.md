# ui — дизайн-система

Компоненты без доменной логики. Снаружи импорт только из корня — `@/shared/ui`
(`index.ts` собирает всё из папок); внутри `ui` — относительные пути.

| Папка       | Что                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `text/`     | `Typography`, иконки (`Icon` — Material, `CustomIcon` — свои глифы), `Logo`, `ProBadge`, `Badge` (пометка «Сегодня» или тег-контур) |
| `buttons/`  | `Button` (основная, второстепенная, опасная), круглая `GlassIconButton`, `TextButton` (ссылка без подложки)                         |
| `inputs/`   | `Input`, `CodeInput` (код из письма по ячейкам), `Composer` (текст с отправкой), `DismissKeyboard`                                  |
| `layout/`   | `ScreenContainer` (safe area, прокрутка под статус-бар, pull-to-refresh, шапка), `FloatingHeader`, `Section`, `TabBar`, `Divider`   |
| `content/`  | `Card`, `GlassCard`, `ListRow`/`ListGroup`, `StatTile`, `UserAvatar`                                                                |
| `feedback/` | `BottomSheet` (все шторки), тосты (`toast`, `Toaster`), `ErrorState`, `EmptyState`, `ListEmpty` (пусто / ошибка / загрузка списка)  |
| `motion/`   | `FadeInItem` (появление карточек списка), `FadeInCover` (появление экрана), `AuroraBackground`                                      |
| `glass/`    | `GlassView` — Liquid Glass, если он есть в сборке                                                                                   |

## Как пользоваться

- **Шапка вкладок** закреплена: `ScreenContainer header={<AppHeader />}` ставит её над прокруткой —
  не уезжает ни при прокрутке, ни при оттягивании. На экранах с обложкой под статус-баром —
  `FloatingHeader` поверх списка: прозрачный над обложкой, фон проявляется, когда обложка уехала.
- **Текст с отправкой** (комментарии, посты, обратная связь) — `Composer`: «+» слева открывает меню
  вложений поверх соседних блоков, справа — кнопка отправки с зоной касания 56pt.
- **Клавиатура:** экраны и шторки с полями оборачивают пустое место в `DismissKeyboard` —
  тап мимо поля её прячет. `BottomSheet` делает это сам. Подъём над клавиатурой —
  `KeyboardAvoidingView` из `react-native-keyboard-controller` с `behavior="padding"` на обеих
  платформах (не из `react-native`): в edge-to-edge Android сам окно не поджимает, в том числе
  внутри `Modal` шторки.
- **Уведомления** поверх экрана — `toast.show({ id, type, title, duration })` и `toast.dismiss(id)`;
  слой `Toaster` смонтирован в корневом layout, тост с тем же `id` обновляется на месте.

## Liquid Glass

`Button`, `GlassIconButton`, `GlassCard` и `Input` на iOS 26+ — нативное стекло (`glass/glass.ts`,
`expo-glass-effect`) без заливки под ним — иначе стекло выглядит плоским; на Android, старых iOS
и в сборке без модуля — обычная заливка.
Стекло не рисуется внутри полупрозрачного родителя: экраны с ним появляются через `FadeInCover`
(растворяется слой цвета фона), а не через opacity, и карточки со стеклом не оборачивают в `FadeInItem`.

Цвета, отступы и шрифты — только из `theme`.
