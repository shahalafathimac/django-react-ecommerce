from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="users.user_created_signal")
def user_created_signal(sender, instance, created, **kwargs):
    if created:
        print(f"New user created: {instance.email}")
