"""Бэкенд сайта «Мел»: раздаёт склеенный в один файл сайт."""
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

BACKEND_DIR = Path(__file__).resolve().parent
SITE_DIR = BACKEND_DIR.parent

load_dotenv(BACKEND_DIR / ".env")

app = FastAPI(title="Мел — сайт")


def build_page_html(page_name: str) -> str:
    """Склеивает HTML-страницу со style.css и script.js в один файл.

    Источники правды остаются в корне проекта (index.html/404.html/style.css/script.js) —
    склейка происходит один раз при старте сервера, а не хранится отдельным файлом.
    Страница без <script src="script.js"> (например, 404) просто не получит подстановку.
    """
    html = (SITE_DIR / page_name).read_text(encoding="utf-8")
    css = (SITE_DIR / "style.css").read_text(encoding="utf-8")
    script_js = (SITE_DIR / "script.js").read_text(encoding="utf-8")

    # href/src сверяются с учётом ?v=... — иначе смена версии в index.html
    # (кэш-бастинг при локальной разработке) молча ломает подстановку в проде.
    html = re.sub(
        r'<link rel="stylesheet" href="style\.css(?:\?[^"]*)?" />',
        lambda _match: f"<style>\n{css}\n</style>",
        html,
    )
    html = re.sub(
        r'<script src="script\.js(?:\?[^"]*)?"></script>',
        lambda _match: f"<script>\n{script_js}\n</script>",
        html,
    )

    return html


INDEX_HTML = build_page_html("index.html")
NOT_FOUND_HTML = build_page_html("404.html")

# Явные маршруты для картинок/иконок вместо монтирования всей папки проекта —
# чтобы наружу не утекли backend/.env и прочие файлы репозитория.
STATIC_ASSETS = {
    "/favicon.ico": SITE_DIR / "favicon.ico",
    "/logo.svg": SITE_DIR / "logo.svg",
    "/logo_footer.svg": SITE_DIR / "logo_footer.svg",
}

for route_path, file_path in STATIC_ASSETS.items():
    app.get(route_path, include_in_schema=False)(lambda fp=file_path: FileResponse(fp))

# Фотографии (галерея, специалисты) — отдельная папка img/, в ней нет ничего секретного,
# поэтому её можно смонтировать целиком. StaticFiles сам не выпускает за пределы папки.
app.mount("/img", StaticFiles(directory=SITE_DIR / "img"), name="img")


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def index():
    return INDEX_HTML


# Обработчик вешаем на starlette-версию HTTPException: fastapi.HTTPException — её наследник,
# а несуществующий маршрут роутер отдаёт именно как starlette-исключение.
@app.exception_handler(StarletteHTTPException)
def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Человеку — меловая страница 404, API-клиенту — привычный JSON.
    if exc.status_code == 404 and not request.url.path.startswith("/api"):
        return HTMLResponse(content=NOT_FOUND_HTML, status_code=404)
    return JSONResponse(status_code=exc.status_code, content={"ok": False, "error": exc.detail})


@app.get("/api/health")
def health():
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=os.environ.get("RELOAD") == "1")
