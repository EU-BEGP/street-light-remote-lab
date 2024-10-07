from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.utils import timezone
from utils.tools import send_custom_email
import random


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create a new user and validate email"""
        if not email:
            raise ValueError("Email address required")

        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.is_active = False

        # Generate random verification code for the new user
        verification_code = "".join(random.choices("0123456789", k=6))
        user.email_verification_code = verification_code

        # Send account activation email
        subject = "User Account Activation"

        context = {
            "user_name": user.name + " " + user.last_name,
            "verification_code": verification_code,
        }
        template_name = "user_account_activation_template.html"
        recipient = [user.email]

        send_custom_email(subject, template_name, context, recipient)

        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """Creates and saves a new super user"""
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)

        return user


def default_expiration_time():
    return timezone.now() + timezone.timedelta(minutes=15)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model that suppors using email instead of username"""

    email = models.EmailField(max_length=255, unique=True)
    email_verification_code = models.CharField(
        max_length=6, unique=True, default=None, null=True
    )
    email_expiration_time = models.DateTimeField(default=default_expiration_time)
    name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()
    USERNAME_FIELD = "email"
