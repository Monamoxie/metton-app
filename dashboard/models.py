from django.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractUser,
    UserManager as PackageUserManager,
)


# Create your models here.
class User(AbstractUser):
    username = None
    first_name = None
    last_name = None

    email = models.EmailField("email_address", unique=True)
    name = models.CharField("name", max_length=190, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []


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
