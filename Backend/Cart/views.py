from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api import SafeAPIView
from products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


def get_user_cart(user):
    return Cart.objects.get_or_create(user=user)[0]


class CartAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid quantity."}, status=status.HTTP_400_BAD_REQUEST)

        if quantity < 1:
            return Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id)
        cart = get_user_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        next_quantity = quantity if created else item.quantity + quantity
        if next_quantity > product.stock:
            return Response(
                {"error": "Requested quantity exceeds available stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = next_quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid quantity"}, status=400)
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(
            CartItem.objects.select_related("product", "cart"),
            id=item_id,
            cart__user=request.user,
        )

        if quantity > item.product.stock:
            return Response(
                {"error": "Requested quantity exceeds available stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.save()

        return Response(CartSerializer(item.cart).data)

    def delete(self, request, item_id):
        item = get_object_or_404(CartItem.objects.select_related("cart"), id=item_id, cart__user=request.user)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class ClearCartAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_user_cart(request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared successfully."}, status=status.HTTP_200_OK)
