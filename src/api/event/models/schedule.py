from django.db import models

from core import settings


class Schedule(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="schedules"
    )
    name = models.CharField(max_length=100, default="Working Hours")
    timezone = models.CharField(max_length=100, default="UTC")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "event_schedules"

    def __str__(self):
        return f"{self.user} - {self.name}"
