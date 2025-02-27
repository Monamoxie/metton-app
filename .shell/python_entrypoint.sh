#!/bin/bash

echo "Running migrations..."
python manage.py migrate

echo "Starting Celery worker..."
celery -A core worker -l info &

# Read the value of PROJECT_ENV environment variable
PROJECT_ENV="${PROJECT_ENV:-development}"
if [ "$PROJECT_ENV" == "production" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput

    echo "Starting Gunicorn..."
    gunicorn --bind 0.0.0.0:8000 core.wsgi:application
else
    echo "Starting development server..."
    python manage.py runserver 0.0.0.0:8000 --skip-checks
fi