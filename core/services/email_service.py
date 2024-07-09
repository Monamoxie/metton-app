from django.contrib.sites.shortcuts import get_current_site
from django.templatetags.static import static
import os
from core import settings
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.template.loader import render_to_string
from typing import Union

from core.custom_exceptions import InvalidInputException


class EmailService:
    @staticmethod
    def push(subject: str, recipients: Union[str, list], template: str, context: dict):
        convert_to_html_content = render_to_string(
            template_name=template, context=context
        )
        plain_message = strip_tags(convert_to_html_content)

        if not isinstance(recipients, list) and not isinstance(recipients, str):
            raise InvalidInputException()

        return send_mail(
            subject=subject,
            message=plain_message,
            from_email=f"{settings.DEFAULT_FROM_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
            recipient_list=recipients if isinstance(recipients, list) else [recipients],
            html_message=convert_to_html_content,
        )
