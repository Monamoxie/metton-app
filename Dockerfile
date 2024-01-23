FROM python:3.13-rc-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./app/

RUN pip install --upgrade pip

RUN pip install gunicorn

RUN pip install --no-cache-dir -r ./app/requirements.txt

COPY . /app/

# RUN python manage.py collectstatic --noinput

CMD ["python", "manage.py", "migrate"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "your_django_app.wsgi:application"]