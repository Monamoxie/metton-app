import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractUser,
)
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager

from dashboard.enums import EventTypes
from .event import Event


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

    objects = CustomUserManager()

    email = models.EmailField("email_address", unique=True)
    name = models.CharField("name", max_length=190, blank=True)
    company = models.CharField("company", max_length=190, blank=True)
    position = models.CharField("position", max_length=190, blank=True)
    profile_summary = models.TextField("profile_summary", blank=True)
    profile_photo = models.ImageField(
        name="profile_photo",
        upload_to="dashboard.models.user.rename_file",
        blank=True,
        null=True,
        width_field="width_field",
        height_field="height_field",
    )
    public_id = models.CharField("public_id", max_length=190, blank=True, unique=True)

    height_field = models.IntegerField(default=180)
    width_field = models.IntegerField(default=180)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(self.email)

    def has_business_hours(self):
        return self.event_set.filter(type=EventTypes.BUSINESS_HOURS.value).exists()

    def save(self, *args, **kwargs):
        if self.public_id == "" or self.public_id is None:
            id_exists = True
            while id_exists:
                p_id = uuid.uuid4().hex[:7]
                if not User.objects.filter(public_id=p_id).exists():
                    id_exists = False
            self.public_id = p_id

        super().save(*args, **kwargs)  # Call the "real" save() method.
