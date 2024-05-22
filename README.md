<p align="left"><img src="core/static/images/logo.png"></p>

# METTON

A full-stack web app powered by Python and Django, designed to provide a seamless and efficient appointment management solution. Whether you are a solopreneur, SME, or a startup, Metton helps you optimize your scheduling, enhance client interactions, and drive your business forward.

[![Github Actions](https://github.com/Monamoxie/metton-python-utility-scheduler/actions/workflows/metton.yml/badge.svg)](https://github.com/Monamoxie/metton-python-utility-scheduler/actions/workflows/metton.yml)

</p>

## Technology Stack

- Python
- RabbitMQ / Celery
- MySQL
- Docker
- Django
- Gunicorn
- Nginx
- JavaScript
- Bootstrap 5

## Devops and Cloud - Prod Setup

- Github Actions - CI/CD
- AWS fargate - Serverless
- AWS ECR - Container registry
- AWS ECS - Container orchestration
- AWS MQ - Message Broker
- AWS RDS - Database Service
- AWS Cloudwatch - Logs and monitoring
- AWS Systems Manager - Env variables and secrets

## Note

## Set up Instructions for Development

- Clone repo
- Run `cp env.example .env` and fill up details as desired
- Run `chmox +x ./python_entrypoint.sh`
- Run `docker-compose up --build -d --wait`
- Visit http://127.0.0.1:8080
- For local setup, you make use of the RabbitMQ and MySQL docker images
- In production, we take advantage of AWS infrastrures by using MQ and RDS

## Network flow

- `Nginx` acts as a reverse proxy; through port 8080 on the Host machine & port 80 within the container
- `Nginx` serves static contents & transfers incoming requests to `Gunicorn`
- `Gunicorn` serves the app on port 8000.
- `Python` service EXPOSES port 8000 for this purpose.
- `collectstatic` uses /var/www/static as static volume
- `Python` and `Nginx` both share the same static volume
  <br>

### Architecture - High Level Design

<p align="center"><img src="core/static/images/snapshots/metton-high-level-design.svg"></p>

## And it comes with a beautiful User Interface you can customize or use straight out the box

#### Landing page

<p align="center"><img src="core/static/images/snapshots/home.png"></p>

#### All pages are responsive

<p align="center"><img src="core/static/images/snapshots/home-mobile-view.png"></p>

#### Booking page

<p align="center"><img src="core/static/images/snapshots/booking-page.png"></p>

#### Manage Schedules

<p align="center"><img src="core/static/images/snapshots/manage-schedules.png"></p>

#### Manage Appointments

<p align="center"><img src="core/static/images/snapshots/upcoming-appointments.png"></p>

## License

Open-sourced and licensed under the [MIT license](https://opensource.org/licenses/MIT).
