from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'user')
        extra_fields.setdefault('active', True)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('active', True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    # ── Core Fields ──────────────────────────────────────────
    name            = models.CharField(max_length=100)
    email           = models.EmailField(unique=True)
    role            = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    active          = models.BooleanField(default=True)

    # ── Address (mirrors your frontend address:{} object) ────
    street          = models.CharField(max_length=255, blank=True, null=True)
    city            = models.CharField(max_length=100, blank=True, null=True)
    state           = models.CharField(max_length=100, blank=True, null=True)
    zip_code        = models.CharField(max_length=20,  blank=True, null=True)
    country         = models.CharField(max_length=100, blank=True, null=True)

    # ── Django Required Fields ────────────────────────────────
    is_staff        = models.BooleanField(default=False)
    is_superuser    = models.BooleanField(default=False)
    date_joined     = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        verbose_name = 'User'

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def is_active(self):
        return self.active

    @property
    def is_admin(self):
        return self.role == 'admin'