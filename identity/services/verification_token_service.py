import hashlib
from http.client import NOT_FOUND
from typing import Union
from django.urls import reverse
from core import settings
from dashboard.models.user import User
import secrets
from identity.enums import VerificationTokenTypes
from identity.models.verification_token import VerificationToken
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class VerificationTokenService:
    EXPIRED_STATUS = "Token is expired"
    SUCCESS_STATUS = "success"
    NOT_FOUND_STATUS = "Invalid token"
    NO_USER_FOUND = "No user found"

    def __init__(self, type: str, user: Union[None, User, AbstractUser]) -> None:
        self.type = type
        self.user = user

        if type not in VerificationTokenTypes.get_values():
            raise ValueError("Unknown verification type")

    def generate_email_token(self) -> Union[str, None]:
        """Generate email token"""
        if not self.user:
            return self.NO_USER_FOUND

        unhashed_token = f"{secrets.token_urlsafe(32)}{self.user.email}"
        hashed_token = self._hash_token(unhashed_token)
        expires_at = timezone.now() + timedelta(hours=24)

        if self._save(hashed_token=hashed_token, expires_at=expires_at):
            return unhashed_token

        return None

    @staticmethod
    def generate_email_verification_url(token: str) -> str:
        """Generate email verification url"""
        relative_url = reverse("email-verification", kwargs={"token": token})
        return f"{settings.BASE_URL}{relative_url}"

    def verify_email_token(self, token: str):
        hashed_token = self._hash_token(token)

        try:
            verification_token = VerificationToken.objects.get(token=hashed_token)

            if (
                verification_token.expires_at
                and timezone.now() > verification_token.expires_at
            ):
                return self.EXPIRED_STATUS

            verification_token.user.email_verified = True
            verification_token.user.email_verified_at = timezone.now()
            verification_token.user.save()

            verification_token.delete()

        except VerificationToken.DoesNotExist:
            return self.NOT_FOUND_STATUS

    def _save(self, hashed_token: str, expires_at: datetime) -> VerificationToken:
        return VerificationToken.objects.create(
            type=self.type, user=self.user, token=hashed_token, expires_at=expires_at
        )

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
