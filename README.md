<div align="center">

# 🌿 Мел — детский центр развития

**Нейропсихолог · Дефектолог · Логопед** — Кемерово

*Дорога в будущее*

### [🌐 meldoroga.ru](https://meldoroga.ru)

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
[![Deploy](https://github.com/Yurko-v/Mel-logoped-site/actions/workflows/deploy-beget.yml/badge.svg)](https://github.com/Yurko-v/Mel-logoped-site/actions/workflows/deploy-beget.yml)

</div>

---

## О проекте

Сайт-визитка центра «Мел», который помогает детям с речевыми нарушениями и особенностями развития (РАС, ЗПР, ЗРР, СДВГ). Главная задача страницы — рассказать о центре и привести родителей к записи на консультацию по телефону.

Визуальная идея — **меловая доска**: главный экран нарисован мелом, по нему идёт пунктирная «дорога в будущее», вдоль неё к доске прикреплены фотографии с занятий. Той же доской страница и заканчивается: дорога проходит через четыре шага к первой встрече и приводит к телефону и карте. А на странице 404 на доске можно порисовать.

### Разделы страницы

| Раздел | Что внутри |
|---|---|
| Главный экран | Название, слоган, кнопки записи, фото-«полароиды» на доске |
| О центре | Текст с фотоколлажем и 6 направлений помощи |
| Услуги | Диагностика, дефектолог, запуск речи, логопед, нейрокоррекция, группы |
| Специалисты | Портреты и специализации команды |
| Отзывы | Реальные отзывы родителей из 2ГИС |
| Галерея | Мозаика из 17 фото с полноэкранным просмотром |
| FAQ | Частые вопросы (аккордеон) |
| Первый шаг | Меловая «дорога» из 4 шагов: звонок → знакомство → диагностика → свой маршрут; телефон, адрес, карта |

### Что умеет

- Адаптивная вёрстка: телефон, планшет, десктоп
- Галерея-мозаика без пустот, просмотр фото стрелками, клавиатурой и свайпом
- Анимации появления при прокрутке, учитывается системная настройка «меньше движения»
- Меловая страница 404 с рисованием

---

## Быстрый старт

Сайт и бэкенд — одно FastAPI-приложение. При старте сервер склеивает `index.html` + `style.css` + `script.js` в один HTML, раздаёт его и отдаёт фото из `img/`.

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py
```

Сайт откроется на **http://localhost:5000/**.

> Сборка страницы происходит один раз при запуске, поэтому после правок в `index.html`, `style.css` или `script.js` сервер нужно перезапустить.

---

## Как всё устроено

- **Страница** — чистые HTML/CSS/JS без фреймворков и сборщиков.
- **Сервер** ([backend/app.py](backend/app.py)) встраивает CSS и JS прямо в HTML (ссылки с `?v=…` тоже распознаются), поэтому браузер получает страницу одним запросом.
- **Статика** отдаётся точечно: иконка, логотипы и папка `img/`. Остальные файлы репозитория (в том числе `backend/.env`) снаружи недоступны.
- **404**: любой неизвестный адрес отдаёт [404.html](404.html), кроме `/api/*` — там ответ в JSON.

### Фотографии

Все фото лежат в `img/`, уменьшены и очищены от EXIF (в нём бывает геолокация):

| Папка | Для чего |
|---|---|
| `img/gallery/` | Галерея: `NN.jpg` — полный размер для просмотра, `NN-sm.jpg` — превью для мозаики |
| `img/team/` | Портреты специалистов |
| `img/moments/` | Кадры для главного экрана и блока «О центре» |

Плитки галереи бывают трёх форм (`--big`, `--tall`, `--wide`) и подобраны так, чтобы сетка заполнялась без дыр. При замене фото сохраняйте формы и порядок плиток в `index.html`. Исходники фотографий складываются в `photos/`, эта папка в git не попадает.

---

## Деплой

Продакшен — **[meldoroga.ru](https://meldoroga.ru)** на shared-хостинге Beget под Phusion Passenger.

**Автоматически:** при пуше в `main` workflow [deploy-beget.yml](.github/workflows/deploy-beget.yml) заходит на сервер по SSH, обновляет код и перезапускает приложение:

```bash
cd ~/meldoroga.ru/mel-site && git reset --hard origin/main
touch ~/meldoroga.ru/public_html/tmp/restart.txt
```

Секреты репозитория: `BEGET_HOST`, `BEGET_USER`, `BEGET_SSH_KEY` (приватный ключ в base64: многострочный текст ломается при вставке в поле GitHub).

**Раскладка на сервере** (создаётся один раз вручную):

```
~/meldoroga.ru/
├── public_html/              # docroot — только точка входа, без исходников
│   ├── .htaccess             # PassengerEnabled On + путь до venv/bin/python3
│   └── passenger_wsgi.py     # добавляет ../mel-site/backend в sys.path, оборачивает FastAPI через a2wsgi
├── mel-site/                 # git-клон репозитория
└── venv/                     # зависимости
```

Клон и `venv` лежат **выше** `public_html`, чтобы Apache не мог отдать наружу исходники и `.env`: весь сайт раздаёт само приложение.

**Если изменился `backend/requirements.txt`**, автодеплой это не подхватит. Зайдите в контейнер (`ssh localhost -p222`; снаружи контейнера пакеты для Passenger не видны) и выполните:

```bash
venv/bin/pip install -r ~/meldoroga.ru/mel-site/backend/requirements.txt
```

---

## Структура проекта

```
├── index.html              # Главная страница
├── 404.html                # Страница «не найдено» (меловая доска)
├── style.css               # Стили
├── script.js               # Меню, анимации, FAQ, галерея
├── logo.svg, logo_footer.svg, favicon.ico
├── img/                    # Фотографии (см. «Фотографии»)
├── backend/
│   ├── app.py              # FastAPI: сборка страницы, статика, 404
│   ├── passenger_wsgi.py   # Точка входа для Passenger
│   ├── requirements.txt
│   └── .env.example        # Шаблон настроек (порт)
└── .github/workflows/
    └── deploy-beget.yml    # Автодеплой на Beget
```

---

## Технологии

- **HTML5, CSS3** — CSS-переменные, Grid, Flexbox, медиа-запросы, анимации
- **JavaScript** — ванильный, IntersectionObserver
- **Python, FastAPI** — раздача сайта; `a2wsgi` для Passenger
- **Шрифты** — [Unbounded](https://fonts.google.com/specimen/Unbounded), [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), [Inter](https://fonts.google.com/specimen/Inter), [Caveat](https://fonts.google.com/specimen/Caveat)

---

<div align="center">

© 2026 Детский центр развития «Мел». Все права защищены.

</div>
