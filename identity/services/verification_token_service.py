import hashlib
from http.client import NOT_FOUND
from typing import Union
from django.urls import reverse
from core import settings
from core.message_bag import MessageBag
from dashboard.models.user import User
import secrets
from identity.enums import VerificationTypes
from identity.models.verification_token import VerificationToken
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class VerificationTokenService:
    EXPIRED_STATUS = MessageBag.DATA_IS_EXPIRED.format(data="token")
    SUCCESS_STATUS = MessageBag.SUCCESSFUL_DATA_VALIDATION.format(data="Token")
    NOT_FOUND_STATUS = MessageBag.DATA_IS_INVALID.format(data="token")
    NO_USER_FOUND_STATUS = MessageBag.DATA_NOT_FOUND.format(data="User")
    UNABLE_TO_GENERATE_TOKEN_STATUS = MessageBag.UNABLE_TO_GENERATE_DATA

    def __init__(self, type: str) -> None:
        self.type = type

        if type not in VerificationTypes.get_values():
            raise ValueError("Unknown verification type")

    def generate_token(self, user: Union[User, AbstractUser]) -> Union[str, None]:
        """Generate token"""
        if not user:
            return self.NO_USER_FOUND_STATUS

        email_string = self._hash_token(user.email)
        plain_token = f"{secrets.token_urlsafe(32)}{email_string}"

        hashed_token = self._hash_token(plain_token)
        expires_at = timezone.now() + timedelta(hours=24)

        self.destroy_user_existing_tokens(user)

        if self._save(hashed_token=hashed_token, user=user, expires_at=expires_at):
            return plain_token

        return None

    def generate_email_verification_url(self, token: str) -> str:
        """Generate email verification url"""
        relative_url = reverse("email-verification", kwargs={"token": token})
        return f"{settings.BASE_URL}{relative_url}"

    def generate_reset_password_verification_link(self, token: str) -> str:
        """Generate reset password verification link"""
        relative_url = reverse("password-reset-verification", kwargs={"token": token})
        return f"{settings.BASE_URL}{relative_url}"

    def validate(self, token: str) -> Union[str, VerificationToken]:
        """Check if token is valid"""
        hashed_token = self._hash_token(token)

        verification_token = VerificationToken.objects.filter(
            token=hashed_token, type=self.type
        ).first()

        if not verification_token:
            return self.NOT_FOUND_STATUS

        if (
            verification_token.expires_at
            and timezone.now() > verification_token.expires_at
        ):
            return self.EXPIRED_STATUS

        return verification_token

    def verify_email_token(self, token: str) -> str:
        """Verify email token"""
        verification_token = self.validate(token)

        if not isinstance(verification_token, VerificationToken):
            return verification_token

        if not verification_token.user:
            return self.NO_USER_FOUND_STATUS

        verification_token.user.email_verified = True
        verification_token.user.email_verified_at = timezone.now()
        verification_token.user.save()

        verification_token.delete()

        return self.SUCCESS_STATUS

    def destroy(self, token: str):
        """Destroy token"""
        hashed_token = self._hash_token(token)

        return VerificationToken.objects.filter(
            token=hashed_token, type=self.type
        ).delete()

    def destroy_user_existing_tokens(self, user: Union[User, AbstractUser]):
        """Destroy existing tokens of same type for this user"""
        return VerificationToken.objects.filter(user=user, type=self.type).delete()

    def _save(
        self, hashed_token: str, user: Union[User, AbstractUser], expires_at: datetime
    ) -> VerificationToken:
        """private method to save token"""
        return VerificationToken.objects.create(
            type=self.type, user=user, token=hashed_token, expires_at=expires_at
        )

    def _hash_token(self, token: str) -> str:
        """private method to hash token"""
        return hashlib.sha256(token.encode()).hexdigest()
