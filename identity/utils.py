import os
from typing import Union
from django.contrib.auth.models import AbstractUser
from core import settings
from dashboard.models.user import User
from dashboard.tasks import email_sender
from identity.enums import VerificationTypes
from identity.services import VerificationTokenService


def send_signup_email(user: Union[User, AbstractUser]) -> bool:
    """Trigger an email verification event to Celery/RabbitMQ"""
    type = VerificationTypes.EMAIL_VERIFICATION.value
    service = VerificationTokenService(type)

    token = service.generate_token(user=user)
    if token:
        verification_link = service.generate_email_verification_url(token)
        context = {"verification_link": verification_link}

        template = os.path.join(
            settings.BASE_DIR,
            "identity/templates/identity/emails/email_verification.email.html",
        )
        email_sender.delay("Email Verification", [user.email], template, context)
        return True

    return False
