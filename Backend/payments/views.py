import razorpay
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from orders.serializers import OrderSerializer
from orders.services import CheckoutError, build_checkout_summary, create_order_from_checkout
from .models import Payment


def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def _get_checkout_payload(request):
    return {
        "shipping_info": request.data.get("shipping_info") or request.data.get("shippingInfo") or {},
        "payment_method": request.data.get("payment_method") or request.data.get("paymentMethod") or "razorpay",
        "payment_reference": request.data.get("payment_reference")
        or request.data.get("paymentReference")
        or "",
        "save_address": bool(request.data.get("save_address", False)),
        "items": request.data.get("items"),
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    client = get_razorpay_client()
    if client is None:
        return Response(
            {"error": "Payment gateway is not configured."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    payload = _get_checkout_payload(request)
    payload["payment_method"] = "razorpay"

    try:
        summary = build_checkout_summary(
            user=request.user,
            shipping_info=payload["shipping_info"],
            payment_method=payload["payment_method"],
            direct_items=payload["items"],
        )
    except CheckoutError as exc:
        return Response({"error": exc.message}, status=exc.status_code)

    amount_in_paise = int(summary["total_amount"] * 100)

    try:
        razorpay_order = client.order.create(
            {
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "user_id": str(request.user.id),
                    "email": request.user.email,
                },
            }
        )
    except Exception as exc:
        return Response(
            {"error": f"Razorpay order creation failed: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    payment = Payment.objects.create(
        user=request.user,
        razorpay_order_id=razorpay_order["id"],
        amount=amount_in_paise,
        currency="INR",
        checkout_data={
            **payload,
            "payment_method": "razorpay",
            "payment_reference": "",
            "shipping_fee": str(summary["shipping_fee"]),
            "total_amount": str(summary["total_amount"]),
        },
    )

    return Response(
        {
            "paymentId": payment.id,
            "order_id": razorpay_order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "key": settings.RAZORPAY_KEY_ID,
            "name": "Orovia",
            "description": "Secure jewelry checkout",
            "prefill": {
                "name": payload["shipping_info"].get("name") or request.user.name,
                "email": request.user.email,
                "contact": payload["shipping_info"].get("phone", ""),
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    client = get_razorpay_client()
    if client is None:
        return Response(
            {"error": "Payment gateway is not configured."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    data = request.data
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return Response({"error": "Incomplete payment details."}, status=status.HTTP_400_BAD_REQUEST)

    payment = (
        Payment.objects.select_related("order", "user")
        .filter(razorpay_order_id=razorpay_order_id, user=request.user)
        .first()
    )
    if not payment:
        return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )
    except (razorpay.errors.SignatureVerificationError, KeyError, TokenError):
        payment.status = "failed"
        payment.paid = False
        payment.save(update_fields=["status", "paid"])
        return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        payment.status = "failed"
        payment.paid = False
        payment.save(update_fields=["status", "paid"])
        return Response(
            {"error": f"Razorpay verification failed: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if payment.order_id:
        return Response(
            {
                "message": "Payment already verified.",
                "order": OrderSerializer(payment.order).data,
            }
        )

    checkout_data = payment.checkout_data or {}

    try:
        order = create_order_from_checkout(
            user=request.user,
            shipping_info=checkout_data.get("shipping_info", {}),
            payment_method="razorpay",
            payment_reference=razorpay_payment_id,
            save_address=bool(checkout_data.get("save_address", False)),
            direct_items=checkout_data.get("items"),
            payment_status="Paid",
            transaction_reference=razorpay_payment_id,
            is_paid=True,
        )
    except CheckoutError as exc:
        payment.status = "failed"
        payment.paid = False
        payment.save(update_fields=["status", "paid"])
        return Response({"error": exc.message}, status=exc.status_code)

    payment.order = order
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.paid = True
    payment.status = "paid"
    payment.save(
        update_fields=[
            "order",
            "razorpay_payment_id",
            "razorpay_signature",
            "paid",
            "status",
        ]
    )

    return Response(
        {
            "message": "Payment verified and order placed successfully.",
            "order": OrderSerializer(order).data,
        }
    )
