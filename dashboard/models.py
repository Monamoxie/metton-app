from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    username = None
    first_name = None
    last_name = None

    email = models.EmailField("email_address", unique=True)
    name = models.CharField("name", max_length=190, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
