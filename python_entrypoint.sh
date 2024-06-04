#!/bin/bash

# Read the value of PROJECT_ENV environment variable
PROJECT_ENV="${PROJECT_ENV:-development}"
celery -A core worker -l info &
if [ "$PROJECT_ENV" == "production" ]; then
    python manage.py migrate
    gunicorn --bind 0.0.0.0:8000 core.wsgi:application
else
    python manage.py migrate
    python manage.py runserver 0.0.0.0:8000
fi
