from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.api import SafeAPIView
from users.views import IsAdminRole
from .models import Order
from .serializers import OrderSerializer
from .services import CheckoutError, create_order_from_checkout


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

        if payment_method == "razorpay":
            return Response(
                {"error": "Use the Razorpay payment flow to place this order."},
                status=400,
            )

        try:
            order = create_order_from_checkout(
                user=user,
                shipping_info=shipping_info,
                payment_method=payment_method,
                payment_reference=payment_reference,
                save_address=save_address,
                direct_items=direct_items,
            )
        except CheckoutError as exc:
            return Response({"error": exc.message}, status=exc.status_code)

        return Response(
            {
                "message": "Order placed successfully.",
                "order": OrderSerializer(order).data,
            },
            status=201,
        )


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
