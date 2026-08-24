# 🌿 Мел — Детский центр развития

Сайт детского центра развития **«Мел»** (г. Кемерово).  
Нейропсихолог · Дефектолог · АВА-терапевт

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
- **Услуги** — нейропсихологическая диагностика, дефектолог, АВА-терапия, запуск речи, коррекция поведения, групповые занятия
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

Сайт и бэкенд теперь — одно FastAPI-приложение: при старте сервер склеивает `index.html` + `style.css` + `script.js` в один HTML и сам его раздаёт, плюс обрабатывает `/api/contact`. Один процесс — весь сайт.

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

## 📁 Структура проекта

```
├── index.html            # Основная страница
├── style.css             # Стили (адаптив, анимации, компоненты)
├── script.js             # Логика (меню, FAQ, форма, запрос к бэкенду)
├── config.js             # URL бэкенда (API_URL)
├── logo.svg              # Логотип
├── favicon.ico           # Иконка вкладки
├── 1.png, 2.png          # Фотографии галереи
├── backend/              # Python (FastAPI) бэкенд для приёма заявок
│   ├── app.py            # Раздаёт сайт (склейка HTML+CSS+JS) + POST /api/contact → Telegram
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
