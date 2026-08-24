"""Точка входа для Phusion Passenger (используется хостингами вроде Beget).

Passenger умеет запускать только WSGI-приложения, а FastAPI — ASGI,
поэтому оборачиваем приложение адаптером a2wsgi.
"""
from a2wsgi import ASGIMiddleware

from app import app as asgi_app

application = ASGIMiddleware(asgi_app)
