from rest_framework import serializers
from .models import Cart,CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    name = serializers.CharField(source="product.name")
    image = serializers.CharField(source = "product.image")
    price = serializers.FloatField(source ="product.price")
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id","product_id","name","image","price","quantity","subtotal"]

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "subtotal"]

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())
