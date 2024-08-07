#!/bin/bash

python manage.py migrate
celery -A core worker -l info &

# Read the value of PROJECT_ENV environment variable
PROJECT_ENV="${PROJECT_ENV:-development}"
if [ "$PROJECT_ENV" == "production" ]; then
    python manage.py collectstatic --noinput
    gunicorn --bind 0.0.0.0:8000 core.wsgi:application
else
    python manage.py runserver 0.0.0.0:8000 --skip-checks
fi