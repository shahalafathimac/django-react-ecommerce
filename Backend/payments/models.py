from django.db import models
from django.contrib.auth import get_user_model

from orders.models import Order

# Create your models here.
User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.OneToOneField(
        Order,
        on_delete=models.SET_NULL,
        related_name="payment",
        null=True,
        blank=True,
    )
    razorpay_order_id = models.CharField(max_length=255)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    amount = models.IntegerField()
    currency = models.CharField(max_length=10, default="INR")
    paid = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    checkout_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.razorpay_order_id
