from django.db import models
from core import settings
from dashboard.models.user import User
from identity.enums import VerificationTokenTypes


class VerificationToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(
        choices=VerificationTokenTypes.options(), null=False, blank=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
