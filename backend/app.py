"""Бэкенд сайта «Мел»: раздаёт склеенный в один файл сайт и принимает заявки с формы."""
import json
import logging
import os
import re
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel, field_validator

load_dotenv()

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

PHONE_RE = re.compile(r"\+?\d[\d\s\-()]{9,}\d")

BACKEND_DIR = Path(__file__).resolve().parent
SITE_DIR = BACKEND_DIR.parent

logger = logging.getLogger("mel-backend")
app = FastAPI(title="Мел — сайт и API заявок")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def build_index_html() -> str:
    """Склеивает index.html, style.css и script.js в один HTML-файл.

    Источники правды остаются в корне проекта (index.html/style.css/script.js) —
    склейка происходит один раз при старте сервера, а не хранится отдельным файлом.
    """
    html = (SITE_DIR / "index.html").read_text(encoding="utf-8")
    css = (SITE_DIR / "style.css").read_text(encoding="utf-8")
    script_js = (SITE_DIR / "script.js").read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="style.css" />',
        f"<style>\n{css}\n</style>",
    )
    # Бэкенд и фронтенд теперь на одном origin — конфиг указывает на относительный путь.
    inline_config = f"<script>const TELEGRAM_CONFIG = {json.dumps({'API_URL': '/api/contact'})};</script>"
    html = html.replace('<script src="config.js"></script>', inline_config)
    html = html.replace('<script src="script.js"></script>', f"<script>\n{script_js}\n</script>")

    return html


INDEX_HTML = build_index_html()

# Явные маршруты для картинок/иконок вместо монтирования всей папки проекта —
# чтобы наружу не утекли backend/.env и прочие файлы репозитория.
STATIC_ASSETS = {
    "/favicon.ico": SITE_DIR / "favicon.ico",
    "/logo.svg": SITE_DIR / "logo.svg",
    "/1.png": SITE_DIR / "1.png",
    "/2.png": SITE_DIR / "2.png",
}

for route_path, file_path in STATIC_ASSETS.items():
    app.get(route_path, include_in_schema=False)(lambda fp=file_path: FileResponse(fp))


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def index():
    return INDEX_HTML


class ContactRequest(BaseModel):
    name: str
    phone: str
    age: str = ""
    message: str = ""

    @field_validator("name", "phone", "age", "message")
    @classmethod
    def strip(cls, value: str) -> str:
        return value.strip()

    @field_validator("name", "phone")
    @classmethod
    def not_empty(cls, value: str) -> str:
        if not value:
            raise ValueError("Заполните имя и телефон")
        return value

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        if not PHONE_RE.search(value):
            raise ValueError("Некорректный номер телефона")
        return value


@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    message = first_error.get("msg", "Некорректные данные").removeprefix("Value error, ")
    return JSONResponse(status_code=400, content={"ok": False, "error": message})


@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"ok": False, "error": exc.detail})


@app.get("/api/health")
def health():
    return {"ok": True, "telegram_configured": bool(BOT_TOKEN and CHAT_ID)}


@app.post("/api/contact")
def contact(payload: ContactRequest):
    if not BOT_TOKEN or not CHAT_ID:
        logger.warning("Telegram не настроен, заявка потеряна: %r", payload)
        raise HTTPException(status_code=503, detail="Форма временно не работает, позвоните нам")

    text = (
        "📩 Новая заявка с сайта «Мел»\n\n"
        f"Имя: {payload.name}\n"
        f"Телефон: {payload.phone}\n"
        f"Возраст ребёнка: {payload.age or '—'}\n"
        f"Сообщение: {payload.message or '—'}"
    )

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={"chat_id": CHAT_ID, "text": text},
            timeout=10,
        )
        resp.raise_for_status()
    except requests.RequestException:
        logger.exception("Не удалось отправить сообщение в Telegram")
        raise HTTPException(status_code=502, detail="Ошибка отправки, попробуйте позже")

    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=os.environ.get("RELOAD") == "1")
