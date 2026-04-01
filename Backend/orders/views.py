from decimal import Decimal
from uuid import uuid4
from django.db import transaction
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Cart.models import Cart
from core.api import SafeAPIView
from products.models import Product
from users.views import IsAdminRole
from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderListCreateAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.select_related("user")
            .prefetch_related("items__product")
            .order_by("-created_at")
        )

    def get(self, request):
        orders = self.get_queryset().filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        shipping_info = request.data.get("shipping_info") or request.data.get("shippingInfo") or {}
        payment_method = request.data.get("payment_method") or request.data.get("paymentMethod") or "cod"
        payment_reference = request.data.get("payment_reference") or request.data.get("paymentReference") or ""
        save_address = bool(request.data.get("save_address", False))
        direct_items = request.data.get("items")

        required_fields = ["name", "address", "city", "state", "zip", "phone"]
        missing_fields = [field for field in required_fields if not str(shipping_info.get(field, "")).strip()]
        if missing_fields:
            return Response({"error": f"Missing shipping field: {missing_fields[0]}."}, status=400)

        if payment_method not in {choice for choice, _ in Order.PAYMENT_METHOD_CHOICES}:
            return Response({"error": "Invalid payment method."}, status=400)

        if payment_method in {"card", "upi"} and not str(payment_reference).strip():
            return Response(
                {"error": "Payment reference is required for card and UPI payments."},
                status=400,
            )

        cart = None
        if direct_items:
            source_items = direct_items
        else:
            cart = Cart.objects.prefetch_related("items__product").filter(user=user).first()
            if not cart or not cart.items.exists():
                return Response({"error": "Cart is empty."}, status=400)
            source_items = [
                {"product_id": item.product_id, "quantity": item.quantity}
                for item in cart.items.all()
            ]

        if not isinstance(source_items, list) or not source_items:
            return Response({"error": "At least one order item is required."}, status=400)

        normalized_items = []
        for item in source_items:
            product_id = item.get("product_id") or item.get("id")
            try:
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                return Response({"error": "Invalid item quantity."}, status=400)

            if not product_id:
                return Response({"error": "Each item must include a product id."}, status=400)
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1."}, status=400)

            normalized_items.append({"product_id": product_id, "quantity": quantity})

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                shipping_info=shipping_info,
                payment_method=payment_method,
                payment_status="Pending" if payment_method == "cod" else "Paid",
                transaction_reference=payment_reference or f"TXN-{uuid4().hex[:10].upper()}",
            )
            total_amount = Decimal("0.00")

            for item in normalized_items:
                product = Product.objects.select_for_update().filter(pk=item["product_id"]).first()
                if not product:
                    transaction.set_rollback(True)
                    return Response({"error": f"Product {item['product_id']} was not found."}, status=404)
                if item["quantity"] > product.stock:
                    transaction.set_rollback(True)
                    return Response(
                        {"error": f"Only {product.stock} item(s) available for {product.name}."},
                        status=400,
                    )

                line_price = Decimal(str(product.price))
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item["quantity"],
                    price=line_price,
                )
                total_amount += line_price * item["quantity"]
                product.stock -= item["quantity"]
                product.save(update_fields=["stock"])

            order.total_amount = total_amount
            order.save(update_fields=["total_amount"])

            if save_address:
                user.address = shipping_info
                user.save(update_fields=["address"])

            if cart is not None:
                cart.items.all().delete()

        return Response({
            "message": "Order placed successfully.",
            "order": OrderSerializer(order).data,
        }, status=201)


class AdminOrderListAPIView(SafeAPIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        orders = (
            Order.objects.select_related("user")
            .prefetch_related("items__product")
            .order_by("-created_at")
        )
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderStatusAPIView(SafeAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        order = (
            Order.objects.select_related("user")
            .prefetch_related("items__product")
            .filter(id=order_id)
            .first()
        )
        if not order:
            return Response({"error": "Order not found."}, status=404)

        new_status = request.data.get("status")
        valid_statuses = {choice for choice, _ in Order.STATUS_CHOICES}
        is_admin = getattr(request.user, "role", None) == "admin" or request.user.is_staff

        if not new_status or new_status not in valid_statuses:
            return Response({"error": "Invalid order status."}, status=400)

        if is_admin:
            order.status = new_status
            order.save(update_fields=["status"])
            return Response(OrderSerializer(order).data)

        if order.user_id != request.user.id:
            return Response({"error": "Forbidden."}, status=403)

        if new_status != "Cancelled":
            return Response({"error": "You can only cancel your own order."}, status=400)

        if order.status in {"Delivered", "Cancelled"}:
            return Response({"error": f"Order cannot be changed from {order.status}."}, status=400)

        order.status = "Cancelled"
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)
