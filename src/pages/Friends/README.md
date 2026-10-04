# Friends — друзья

Поиск людей и вкладки: подписки, подписчики, запросы. Экран тонкий — держит только строку
поиска и выбранную вкладку; списки сами грузят свои данные:

- `components/FriendsTabs` — вкладки
- `components/views/PeopleListView` — результаты поиска, подписки или подписчики (`source`)
- `components/views/RequestsListView` — входящие запросы: принять / отклонить

Строка пользователя — `UserRow` из `modules/social/ui`, кнопка подписки — `components/FollowButton`.
Пустой список и ошибка — `ListEmpty` из `shared/ui`.
