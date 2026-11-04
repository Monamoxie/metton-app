from django.contrib.sites.shortcuts import get_current_site
from django.templatetags.static import static
import os
from core import settings
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from typing import Optional, Union

from core.custom_exceptions import InvalidInputException


class EmailService:
    @staticmethod
    def push(
        subject: str,
        recipients: Union[str, list],
        template: str,
        context: dict,
        attachments: Optional[list] = None,
    ):
        """`attachments` is a list of [filename, content, mimetype] - plain lists so the
        call stays JSON-serialisable when it goes through the Celery email_sender task."""
        convert_to_html_content = render_to_string(
            template_name=template, context=context
        )
        plain_message = strip_tags(convert_to_html_content)

        if not isinstance(recipients, list) and not isinstance(recipients, str):
            raise InvalidInputException()

        message = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=f"{settings.DEFAULT_FROM_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
            to=recipients if isinstance(recipients, list) else [recipients],
        )
        message.attach_alternative(convert_to_html_content, "text/html")
        for filename, content, mimetype in attachments or []:
            message.attach(filename, content, mimetype)

        return message.send()
