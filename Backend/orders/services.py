from decimal import Decimal
from uuid import uuid4
from django.db import transaction
from Cart.models import Cart
from products.models import Product
from .models import Order, OrderItem

SHIPPING_FEE = Decimal("50.00")


class CheckoutError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _get_source_items(user, direct_items=None):
    cart = None
    if direct_items:
        source_items = direct_items
    else:
        cart = Cart.objects.prefetch_related("items__product").filter(user=user).first()
        if not cart or not cart.items.exists():
            raise CheckoutError("Cart is empty.", 400)
        source_items = [
            {"product_id": item.product_id, "quantity": item.quantity}
            for item in cart.items.all()
        ]

    if not isinstance(source_items, list) or not source_items:
        raise CheckoutError("At least one order item is required.", 400)

    return cart, source_items


def _normalize_items(source_items):
    normalized_items = []
    for item in source_items:
        product_id = item.get("product_id") or item.get("id")
        try:
            quantity = int(item.get("quantity", 1))
        except (TypeError, ValueError) as exc:
            raise CheckoutError("Invalid item quantity.", 400) from exc

        if not product_id:
            raise CheckoutError("Each item must include a product id.", 400)
        if quantity < 1:
            raise CheckoutError("Quantity must be at least 1.", 400)

        normalized_items.append({"product_id": product_id, "quantity": quantity})

    return normalized_items


def _validate_checkout_input(shipping_info, payment_method, payment_reference):
    required_fields = ["name", "address", "city", "state", "zip", "phone"]
    missing_fields = [
        field for field in required_fields if not str(shipping_info.get(field, "")).strip()
    ]
    if missing_fields:
        raise CheckoutError(f"Missing shipping field: {missing_fields[0]}.", 400)

    valid_methods = {choice for choice, _ in Order.PAYMENT_METHOD_CHOICES}
    if payment_method not in valid_methods:
        raise CheckoutError("Invalid payment method.", 400)

    if payment_method == "upi" and not str(payment_reference).strip():
        raise CheckoutError("Payment reference is required for UPI payments.", 400)


def build_checkout_summary(user, shipping_info, payment_method, payment_reference="", direct_items=None):
    _validate_checkout_input(shipping_info, payment_method, payment_reference)
    _, source_items = _get_source_items(user, direct_items)
    normalized_items = _normalize_items(source_items)

    product_ids = [item["product_id"] for item in normalized_items]
    products_by_id = {product.id: product for product in Product.objects.filter(pk__in=product_ids)}
    requested_quantities = {}
    subtotal = Decimal("0.00")

    for item in normalized_items:
        product = products_by_id.get(item["product_id"])
        if not product:
            raise CheckoutError(f"Product {item['product_id']} was not found.", 404)

        requested_quantities[item["product_id"]] = (
            requested_quantities.get(item["product_id"], 0) + item["quantity"]
        )
        subtotal += Decimal(str(product.price)) * item["quantity"]

    for product_id, requested_quantity in requested_quantities.items():
        product = products_by_id[product_id]
        if requested_quantity > product.stock:
            raise CheckoutError(
                f"Only {product.stock} item(s) available for {product.name}.",
                400,
            )

    shipping_fee = SHIPPING_FEE if normalized_items else Decimal("0.00")
    total_amount = subtotal + shipping_fee

    return {
        "normalized_items": normalized_items,
        "subtotal": subtotal,
        "shipping_fee": shipping_fee,
        "total_amount": total_amount,
    }


def create_order_from_checkout(
    *,
    user,
    shipping_info,
    payment_method,
    payment_reference="",
    save_address=False,
    direct_items=None,
    payment_status=None,
    transaction_reference=None,
    is_paid=None,
):
    summary = build_checkout_summary(
        user=user,
        shipping_info=shipping_info,
        payment_method=payment_method,
        payment_reference=payment_reference,
        direct_items=direct_items,
    )
    cart, _ = _get_source_items(user, direct_items)
    normalized_items = summary["normalized_items"]

    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            shipping_info=shipping_info,
            payment_method=payment_method,
            payment_status=payment_status or ("Pending" if payment_method == "cod" else "Paid"),
            transaction_reference=transaction_reference or payment_reference or f"TXN-{uuid4().hex[:10].upper()}",
            is_paid=is_paid if is_paid is not None else payment_method != "cod",
            shipping_fee=summary["shipping_fee"],
        )

        product_ids = [item["product_id"] for item in normalized_items]
        products_by_id = {
            product.id: product
            for product in Product.objects.select_for_update().filter(pk__in=product_ids)
        }

        requested_quantities = {}
        for item in normalized_items:
            product = products_by_id.get(item["product_id"])
            if not product:
                raise CheckoutError(f"Product {item['product_id']} was not found.", 404)

            requested_quantities[item["product_id"]] = (
                requested_quantities.get(item["product_id"], 0) + item["quantity"]
            )

        for product_id, requested_quantity in requested_quantities.items():
            product = products_by_id[product_id]
            if requested_quantity > product.stock:
                raise CheckoutError(
                    f"Only {product.stock} item(s) available for {product.name}.",
                    400,
                )

        order_items = []
        updated_products = []
        subtotal = Decimal("0.00")

        for item in normalized_items:
            product = products_by_id[item["product_id"]]
            line_price = Decimal(str(product.price))
            subtotal += line_price * item["quantity"]
            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    quantity=item["quantity"],
                    price=line_price,
                )
            )

        for product_id, requested_quantity in requested_quantities.items():
            product = products_by_id[product_id]
            product.stock -= requested_quantity
            updated_products.append(product)

        OrderItem.objects.bulk_create(order_items)
        Product.objects.bulk_update(updated_products, ["stock"])

        order.total_amount = subtotal + order.shipping_fee
        order.save(update_fields=["total_amount"])

        if save_address:
            user.address = shipping_info
            user.save(update_fields=["address"])

        if cart is not None and not direct_items:
            cart.items.all().delete()

    return order
