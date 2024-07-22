import hashlib
from http.client import NOT_FOUND
from typing import Union
from django.urls import reverse
from core import settings
from dashboard.models.user import User
import secrets
from identity.enums import VerificationTypes
from identity.models.verification_token import VerificationToken
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class VerificationTokenService:
    EXPIRED_STATUS = "Token is expired"
    SUCCESS_STATUS = "success"
    NOT_FOUND_STATUS = "Invalid token"
    NO_USER_FOUND_STATUS = "No user found"
    UNABLE_TO_GENERATE_TOKEN_STATUS = "Unable to generate token"

    def __init__(self, type: str, user: Union[None, User, AbstractUser]) -> None:
        self.type = type
        self.user = user

        if type not in VerificationTypes.get_values():
            raise ValueError("Unknown verification type")

    def generate_token(self) -> Union[str, None]:
        """Generate token"""
        if not self.user:
            return self.NO_USER_FOUND_STATUS

        email_string = self._hash_token(self.user.email)
        plain_token = f"{secrets.token_urlsafe(32)}{email_string}"

        hashed_token = self._hash_token(plain_token)
        expires_at = timezone.now() + timedelta(hours=24)

        if self._save(hashed_token=hashed_token, expires_at=expires_at):
            return plain_token

        return None

    @staticmethod
    def generate_email_verification_url(token: str) -> str:
        """Generate email verification url"""
        relative_url = reverse("email-verification", kwargs={"token": token})
        return f"{settings.BASE_URL}{relative_url}"

    def generate_reset_password_verification_link(self, token: str) -> str:
        """Generate reset password verification link"""
        relative_url = reverse("password-reset-verification", kwargs={"token": token})
        return f"{settings.BASE_URL}{relative_url}"

    def verify_email_token(self, token: str):
        """Verify email token"""
        hashed_token = self._hash_token(token)

        verification_token = VerificationToken.objects.filter(
            token=hashed_token
        ).first()

        if not verification_token:
            return self.NOT_FOUND_STATUS

        if (
            verification_token.expires_at
            and timezone.now() > verification_token.expires_at
        ):
            return self.EXPIRED_STATUS

        if not verification_token.user:
            return self.NO_USER_FOUND_STATUS

        verification_token.user.email_verified = True
        verification_token.user.email_verified_at = timezone.now()
        verification_token.user.save()

        verification_token.delete()

        return self.SUCCESS_STATUS

    def _save(self, hashed_token: str, expires_at: datetime) -> VerificationToken:
        """private method to save token"""
        return VerificationToken.objects.create(
            type=self.type, user=self.user, token=hashed_token, expires_at=expires_at
        )

    def _hash_token(self, token: str) -> str:
        """private method to hash token"""
        return hashlib.sha256(token.encode()).hexdigest()
