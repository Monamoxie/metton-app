"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os
from django.contrib.messages import constants as messages

# from django.contrib.auth import get_user_model

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

BASE_URL = os.environ.get("BASE_URL")

PROJECT_NAME = os.environ.get("PROJECT_NAME")

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
PROJECT_ENV = os.environ.get("PROJECT_ENV")

DEBUG = os.environ.get("PROJECT_ENV") != "production"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ALLOWED_HOSTS = [
    host.strip() for host in os.environ.get("ALLOWED_HOSTS").split(",") if host.strip()
]
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CSRF_TRUSTED_ORIGINS").split(",")
    if origin.strip()
]
CSRF_COOKIE_HTTPONLY = True
CSRF_HEADER_NAME = "HTTP_X_CSRFTOKEN"


# Application definition
INSTALLED_APPS = [
    "tempus_dominus",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_dump_die",
    "dashboard",
    "identity",
    "home",
    "django.contrib.admin",
    "django.contrib.auth",
    "widget_tweaks",
]

AUTH_USER_MODEL = "dashboard.User"

LOGIN_URL = "/identity/login"

MESSAGE_TAGS = {
    messages.INFO: "alert alert-primary p-3",
    messages.SUCCESS: "alert alert-success p-3",
    messages.WARNING: "alert alert-warning p-3",
    messages.ERROR: "alert alert-danger p3",
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_dump_die.middleware.DumpAndDieMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "core", "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.utils.template_data",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": os.environ.get("DB_ENGINE"),
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
    },
    "OPTIONS": {
        "init_command": "SET foreign_key_checks = 0;",
    },
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

if os.environ.get("PROJECT_ENV") != "production":
    STATIC_URL = "/dev_assets/"
    STATIC_ROOT = os.path.join(BASE_DIR, "core", "static/")
else:
    STATIC_URL = "/assets/"
    # a special dir within the docker container
    STATIC_ROOT = "/var/www/static/"

    # Extra directories where static files may be located
    # Centralized directory for all static assets within the project
    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "core", "static"),
    ]

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "core/media/")

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# EMAIL
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND")

# If using Django SES Backend
AWS_SES_ACCESS_KEY_ID = os.environ.get("AWS_SES_ACCESS_KEY_ID")
AWS_SES_SECRET_ACCESS_KEY = os.environ.get("AWS_SES_SECRET_ACCESS_KEY")
AWS_SES_REGION_NAME = os.environ.get("AWS_SES_REGION_NAME")
AWS_SES_REGION_ENDPOINT = os.environ.get("AWS_SES_REGION_ENDPOINT")

# If using Django Email Backend
EMAIL_HOST = os.environ.get("EMAIL_HOST")
EMAIL_PORT = os.environ.get("EMAIL_PORT")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
SERVER_EMAIL = os.environ.get("SERVER_EMAIL")
EMAIL_USE_SSL = True
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")
DEFAULT_FROM_NAME = os.environ.get("DEFAULT_FROM_NAME")

# Custom settings
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL")
