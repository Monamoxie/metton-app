"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path
import dotenv
from django.core.wsgi import get_wsgi_application

if os.environ.get("PROJECT_ENV") != "production":
    # Load .env from repo root (three levels up from core/wsgi.py)
    root_dir = Path(__file__).resolve().parent.parent.parent.parent
    dotenv.read_dotenv(root_dir / ".env", override=True)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = get_wsgi_application()
