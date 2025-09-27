src/
├── core/                  # базовые механизмы (не завязаны на todo)
│   ├── bus.js             # глобальная шина событий
│   ├── store.js           # состояние + подписки
│   ├── router.js          # примитивный роутинг
│   ├── config.js          # загрузка runtime-конфига
│   └── commands.js        # глобальный command bus (register/run)
│
├── lib/                   # мелкие утилиты и UI-хелперы
│   ├── dom.js             # el(), mount(), replaceChildren()
│   ├── ui-kit.js          # opt(), select(), row(), inputText(), ...
│   └── local-commands.js  # мини-command bus для компонента
│
├── ui/                    # общие UI-компоненты
│   ├── Layout.js          # header/footer/main
│   └── Button.js          # универсальная кнопка + делегирование
│
├── features/              # отдельные "фичи" приложения
│   └── todos/
│       ├── model.js       # бизнес-логика задач
│       ├── service.js     # работа с API
│       ├── filters.js     # словари фильтров
│       ├── sorters.js     # словари сортировок
│       └── view/
│           ├── index.js   # экран (createTodosView)
│           ├── composer.js# форма создания/редактирования
│           └── card.js    # карточка задачи
│
└── main.js                # точка входа