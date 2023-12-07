import os
from time import timezone
import uuid
from django.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractUser,
    UserManager as PackageUserManager,
)
from django.utils.translation import gettext_lazy as _


def rename_file(instance, filename):
    directory = "profile_photos/"
    file_ext = filename.split(".")[-1]

    file_name = "profile_photo_" + str(instance.id) + "." + file_ext
    return directory + file_name


# Create your models here.
class User(AbstractUser):
    username = None
    first_name = None
    last_name = None

    email = models.EmailField("email_address", unique=True)
    name = models.CharField("name", max_length=190, blank=True)
    company = models.CharField("company", max_length=190, blank=True)
    position = models.CharField("position", max_length=190, blank=True)
    profile_summary = models.TextField("profile_summary", blank=True)
    profile_photo = models.ImageField(
        name="profile_photo",
        upload_to=rename_file,
        blank=True,
        null=True,
        width_field="width_field",
        height_field="height_field",
    )

    height_field = models.IntegerField(default=180)
    width_field = models.IntegerField(default=180)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(self.id)

    def has_business_hours(self):
        return self.event_set.filter(type=Event.EventTypes.BUSINESS_HOURS).exists()


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email, and password.
        """
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

    # def with_perm(
    #     self, perm, is_active=True, include_superusers=True, backend=None, obj=None
    # ):
    #     package_user_manager = PackageUserManager

    #     return package_user_manager.with_perm(
    #         perm, is_active=True, include_superusers=True, backend=None, obj=None
    #     )


class Event(models.Model):
    class EventTypes(models.TextChoices):
        PUBLIC = "1", _("Public")
        BUSINESS_HOURS = "2", _("Business Hours")
        UNAVAILABLE = "3", _("Unavailable")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField("title", blank=True, max_length=100)
    start_date = models.DateField("start_date", blank=False)
    start_time = models.TimeField("start_time", blank=False)
    end_date = models.DateField("end_date", blank=True)
    end_time = models.TimeField("end_time", blank=True)
    frequency = models.CharField("frequency", blank=True, max_length=100)
    # closed_dates = models.BooleanField("closed_dates", blank=False, default=False)
    type = models.CharField(
        choices=EventTypes.choices, default=EventTypes.PUBLIC, max_length=2
    )
    note = models.TextField("note", blank=True, max_length=250)
    timezone = models.CharField("timezone", blank=True, max_length=100)
    attendees = models.TextField("attendee_emails", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.title}"

    def get_frequency_choices(self):
        choices = {
            "no": "Once",
            "0": "Every Sunday",
            "1": "Every Monday",
            "2": "Every Tuesday",
            "3": "Every Wednesday",
            "4": "Every Thursday",
            "5": "Every Friday",
            "6": "Every Saturday",
        }

        return choices
