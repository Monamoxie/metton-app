#!/bin/bash

# Read the value of APP_ENV environment variable
APP_ENV="${APP_ENV:-development}"

if [ "$APP_ENV" == "production" ]; then
    python manage.py migrate
    gunicorn --bind 0.0.0.0:8000 core.wsgi:application
else
    python manage.py migrate
    python manage.py runserver 0.0.0.0:8000
fi
