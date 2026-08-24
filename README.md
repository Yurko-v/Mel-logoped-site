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

Статический сайт — просто откройте `index.html` в браузере.  
Или запустите через любой локальный сервер, например:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

---

## ⚙️ Бэкенд и настройка Telegram-бота

Заявки с формы принимает небольшой Python (FastAPI) бэкенд в [backend/](backend/), который пересылает их в Telegram. Статический сайт (GitHub Pages) сам Python не выполняет — бэкенд нужно запускать отдельно (локально или на любом хостинге вроде Render/Railway/PythonAnywhere/VPS).

### Запуск бэкенда

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
copy .env.example .env      # Windows; на macOS/Linux: cp .env.example .env
```

Заполните `backend/.env`:

1. Создайте бота через [@BotFather](https://t.me/BotFather) в Telegram, получите `TELEGRAM_BOT_TOKEN`
2. Узнайте `TELEGRAM_CHAT_ID` (например, через [@userinfobot](https://t.me/userinfobot) или API `getUpdates`)
3. `ALLOWED_ORIGIN` — домен сайта в проде (для локальной разработки можно оставить `*`)

Запустите сервер:

```bash
python app.py
# или: uvicorn app:app --reload --port 5000
```

Бэкенд поднимется на `http://localhost:5000`, эндпоинт формы — `POST /api/contact`, автодокументация (Swagger UI) — `http://localhost:5000/docs`.

### Подключение фронтенда к бэкенду

В [config.js](config.js) укажите адрес бэкенда:

```js
const TELEGRAM_CONFIG = {
    API_URL: 'http://localhost:5000/api/contact'  // или адрес прод-хостинга бэкенда
};
```

Для деплоя на GitHub Pages URL прод-бэкенда задаётся через переменную репозитория **Settings → Secrets and variables → Actions → Variables → `BACKEND_API_URL`** — workflow [deploy.yml](.github/workflows/deploy.yml) подставит её в `config.js` при сборке.

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
│   ├── app.py            # Сервер: POST /api/contact → Telegram
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
- **Python / FastAPI** — бэкенд приёма заявок ([backend/app.py](backend/app.py))
- **Telegram Bot API** — отправка заявок

---

## 📄 Лицензия

© 2026 Детский центр развития «Мел». Все права защищены.
