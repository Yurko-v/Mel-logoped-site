# 🌿 Мел — Детский центр развития

Сайт детского центра развития **«Мел»** (г. Кемерово).  
Нейропсихолог · Дефектолог · Логопед

> *Дорога в будущее*

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 📋 О проекте

Лендинг-сайт для детского центра развития «Мел», специализирующегося на помощи детям с особенностями развития, речевыми нарушениями, РАС, ЗПР, СДВГ.

### Разделы сайта

- **Главный экран** — название, слоган, кнопки записи
- **О центре** — направления помощи (6 карточек)
- **Услуги** — нейропсихологическая диагностика, дефектолог, запуск речи, логопед, нейропсихологическая коррекция, групповые занятия
- **Специалисты** — карточки команды
- **Отзывы** — отзывы родителей
- **Галерея** — слайдер с фотографиями
- **FAQ** — аккордеон с частыми вопросами
- **Контакты** — форма записи + карта + контактная информация

### Возможности

- ✅ Полностью адаптивный дизайн (мобильные, планшеты, десктоп)
- ✅ Мобильное меню-бургер с оверлеем
- ✅ Анимации при скролле (IntersectionObserver)
- ✅ FAQ-аккордеон
- ✅ Отправка заявок в Telegram-бот
- ✅ Форматирование телефона (+7)
- ✅ Плавный скролл к секциям

---

## 🚀 Запуск

Сайт и бэкенд теперь — одно FastAPI-приложение: при старте сервер склеивает `index.html` + `style.css` + `script.js` в один HTML и сам его раздаёт, плюс обрабатывает `/api/contact`. Один процесс — весь сайт. Любой неизвестный адрес (кроме `/api/*`, где остаётся JSON) отдаёт страницу [404.html](404.html) со статусом 404.

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
copy .env.example .env      # Windows; на macOS/Linux: cp .env.example .env
python app.py
```

Открой **http://localhost:5000/** — увидишь сайт целиком. Правки в `index.html`/`style.css`/`script.js` подхватятся после перезапуска сервера (сборка происходит один раз при старте).

> Открывать `index.html` напрямую двойным кликом больше не нужно для проверки — этот вариант всё ещё технически работает (тогда используется отдельный [config.js](config.js)), но для локальной разработки удобнее через `python app.py`.

---

## ⚙️ Настройка Telegram-бота

Заявки с формы принимает [backend/app.py](backend/app.py) — валидирует и пересылает их в Telegram через Bot API.

Заполните `backend/.env` (создаётся из `backend/.env.example`):

1. Создайте бота через [@BotFather](https://t.me/BotFather) в Telegram, получите `TELEGRAM_BOT_TOKEN`
2. Узнайте `TELEGRAM_CHAT_ID` (например, через [@userinfobot](https://t.me/userinfobot) или API `getUpdates`)
3. `ALLOWED_ORIGIN` — нужен, только если сайт и бэкенд разнесены по разным доменам; при единой раздаче через FastAPI можно оставить `*`

Автодокументация API (Swagger UI) — `http://localhost:5000/docs`.

> ⚠️ Файл `backend/.env` добавлен в `.gitignore` и не попадает в репозиторий.

---

## 🌍 Продакшен (Beget)

Сайт живёт на shared-хостинге Beget под управлением Phusion Passenger (там нет отдельного UI для Python-приложений — задействован общий Docker-контейнер тарифа, доступный по SSH). Ключевые файлы на сервере (не в репозитории, создаются один раз вручную):

- `~/uravelik.beget.tech/.htaccess` — `PassengerEnabled On` + путь до `venv/bin/python3`
- `~/uravelik.beget.tech/passenger_wsgi.py` — добавляет `mel-site/backend` в `sys.path` и оборачивает FastAPI через `a2wsgi.ASGIMiddleware`
- `~/uravelik.beget.tech/venv/` — виртуальное окружение с зависимостями (создано и заполнено **внутри контейнера**, `ssh localhost -p222` — снаружи контейнера пакеты для Passenger не видны)
- `~/uravelik.beget.tech/mel-site/` — git-клон этого репозитория
- `~/uravelik.beget.tech/mel-site/backend/.env` — секреты Telegram на сервере

При пуше в `main` workflow [deploy-beget.yml](.github/workflows/deploy-beget.yml) сам заходит по SSH и обновляет код:

```bash
cd ~/uravelik.beget.tech/mel-site && git reset --hard origin/main
touch ~/uravelik.beget.tech/tmp/restart.txt   # перезапуск Passenger
```

Секреты репозитория для деплоя: `BEGET_HOST`, `BEGET_USER`, `BEGET_SSH_KEY` (приватный SSH-ключ, base64 — сырой multiline-текст ломается при вставке в поле GitHub).

Если менялся `backend/requirements.txt` — автодеплой это не подхватит, нужно вручную зайти в контейнер (`ssh localhost -p222`) и выполнить `venv/bin/pip install -r ~/uravelik.beget.tech/mel-site/backend/requirements.txt`.

---

## 📁 Структура проекта

```
├── index.html            # Основная страница
├── 404.html              # Страница «не найдено» (меловая доска, можно порисовать)
├── style.css             # Стили (адаптив, анимации, компоненты)
├── script.js             # Логика (меню, FAQ, форма, запрос к бэкенду)
├── config.js             # URL бэкенда (API_URL)
├── logo.svg              # Логотип
├── favicon.ico           # Иконка вкладки
├── 1.png, 2.png          # Фотографии галереи
├── backend/              # Python (FastAPI) бэкенд для приёма заявок
│   ├── app.py            # Раздаёт сайт и 404-страницу (склейка HTML+CSS+JS) + POST /api/contact → Telegram
│   ├── passenger_wsgi.py # Точка входа для Passenger-хостингов (WSGI-обёртка над FastAPI)
│   ├── requirements.txt  # Зависимости
│   └── .env.example      # Шаблон секретов (токен бота, chat id)
└── .gitignore            # Исключения из Git
```

---

## 🛠 Технологии

- **HTML5** — семантическая разметка
- **CSS3** — CSS-переменные, Flexbox, Grid, медиа-запросы, анимации
- **JavaScript** — ванильный JS, IntersectionObserver, Fetch API
- **Шрифты** — [Inter](https://fonts.google.com/specimen/Inter), [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), [Unbounded](https://fonts.google.com/specimen/Unbounded)
- **Python / FastAPI** — раздача сайта одним HTML-файлом + приём заявок ([backend/app.py](backend/app.py))
- **Telegram Bot API** — отправка заявок

---

## 📄 Лицензия

© 2026 Детский центр развития «Мел». Все права защищены.
