from celery.utils.log import get_task_logger
from core.celery import app
from core.services import EmailService


@app.task()
def email_sender(subject, recipients, template, context):
    return EmailService.push(
        subject=subject, recipients=recipients, template=template, context=context
    )
