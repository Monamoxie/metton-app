from celery.utils.log import get_task_logger
from core.celery import app
from core.services.email_service import EmailService


@app.task()
def email_sender(subject, template, context):
    return EmailService().push(subject=subject, template=template, context=context)
