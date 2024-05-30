from django.db import models
import uuid
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from dashboard.enums import EventTypes
from core import settings


class Event(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField("title", blank=True, max_length=100)
    start_date = models.DateField("start_date", blank=False)
    start_time = models.TimeField("start_time", blank=False)
    end_date = models.DateField("end_date", blank=True)
    end_time = models.TimeField("end_time", blank=True)
    frequency = models.CharField("frequency", blank=True, max_length=100)
    type = models.CharField(
        choices=EventTypes.options(), default=EventTypes.PUBLIC.value, max_length=2
    )
    note = models.TextField("note", blank=True, max_length=250)
    timezone = models.CharField("timezone", blank=True, max_length=100)
    attendees = models.TextField("attendee_emails", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    end_recur = models.DateField("end_recur", blank=True, null=True)

    def __str__(self):
        return f"{self.user.name} - {self.title} - {str(self.start_date)} : {str(self.start_time)} - {str(self.end_date)} : {str(self.end_time)} "

    def get_user_model(self):
        return get_user_model()
