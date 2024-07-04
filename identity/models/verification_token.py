from django.db import models
from core import settings
from dashboard.models.user import User
from identity.enums import VerificationTokenTypes


class VerificationToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(
        choices=VerificationTokenTypes.options(), max_length=32, null=False, blank=False
    )
    token = models.CharField(blank=False, null=False, max_length=256)
    expires_at = models.DateTimeField(blank=False, null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
