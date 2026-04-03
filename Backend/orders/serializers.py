from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="product.name")
    image = serializers.CharField(source="product.image")
    product_id = serializers.IntegerField(source="product.id")

    class Meta:
        model = OrderItem
        fields = ["id", "product_id", "name", "image", "price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    orderDate = serializers.DateTimeField(source="created_at", read_only=True)
    totalAmount = serializers.DecimalField(
        source="total_amount",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    shippingInfo = serializers.JSONField(source="shipping_info", read_only=True)
    shippingFee = serializers.DecimalField(
        source="shipping_fee",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    paymentMethod = serializers.CharField(source="payment_method", read_only=True)
    paymentStatus = serializers.CharField(source="payment_status", read_only=True)
    transactionReference = serializers.CharField(source="transaction_reference", read_only=True)
    userId = serializers.IntegerField(source="user.id", read_only=True)
    userName = serializers.CharField(source="user.name", read_only=True)
    userEmail = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "userId",
            "userName",
            "userEmail",
            "created_at",
            "orderDate",
            "is_paid",
            "status",
            "paymentMethod",
            "paymentStatus",
            "transactionReference",
            "shippingInfo",
            "shippingFee",
            "total_amount",
            "totalAmount",
            "items",
        ]
