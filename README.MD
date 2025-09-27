## Структура проекта

```text
src/
├── core/                  # базовые механизмы
│   ├── bus.js             # глобальная шина событий
│   ├── store.js           # состояние + подписки
│   ├── router.js          # роутинг
│   ├── config.js          # загрузка runtime-конфига
│   └── commands.js        # глобальный command bus
│
├── lib/                   # утилиты и UI-хелперы
│   ├── dom.js             # el(), mount(), replaceChildren()
│   ├── ui-kit.js          # элементы UI: inputText(), select(), row()...
│   └── local-commands.js  # локальный command bus
│
├── ui/                    # общие UI-компоненты
│   ├── Layout.js          # header/footer/main
│   └── Button.js          # кнопка + делегирование
│
├── features/              # отдельные фичи приложения
│   └── todos/             # todo-лист
│       ├── model.js       # бизнес-логика задач
│       ├── service.js     # работа с API
│       ├── filters.js     # фильтры (all/active/done)
│       ├── sorters.js     # сортировки (дата, срок, название)
│       └── view/          # UI для задач
│           ├── index.js   # собирает экран todo
│           ├── composer.js# форма создания/редактирования
│           └── card.js    # карточка задачи
│
└── main.js                # точка входа
