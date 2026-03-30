from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from Cart.models import Cart, CartItem
from orders.models import Order
from products.models import Category, Product


User = get_user_model()


class OrderApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="orderuser@example.com",
            name="Order User",
            password="password123",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="password123",
            role="admin",
        )
        category = Category.objects.create(name="Ring")
        self.product = Product.objects.create(
            name="Test Ring",
            description="A test ring",
            price=100,
            stock=200,
            image="https://example.com/ring.jpg",
            category=category,
            type="Gold",
        )

    def shipping_info(self, suffix=""):
        return {
            "name": f"Order User{suffix}",
            "address": "Street 1",
            "city": "Chennai",
            "state": "TN",
            "zip": "600001",
            "phone": "9999999999",
        }

    def test_create_order_from_cart(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/orders/",
            {
                "shipping_info": self.shipping_info(),
                "payment_method": "cod",
                "save_address": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["order"]["totalAmount"], "200.00")
        self.assertEqual(response.data["order"]["paymentStatus"], "Pending")
        self.assertEqual(response.data["order"]["items"][0]["product_id"], self.product.id)
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 0)

    def test_user_can_cancel_own_order(self):
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(
            "/api/orders/",
            {
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "shipping_info": self.shipping_info(),
                "payment_method": "cod",
            },
            format="json",
        )
        order_id = create_response.data["order"]["id"]

        cancel_response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "Cancelled"},
            format="json",
        )

        self.assertEqual(cancel_response.status_code, 200)
        self.assertEqual(cancel_response.data["status"], "Cancelled")

    def test_admin_can_update_order_status(self):
        self.client.force_authenticate(user=self.user)
        create_response = self.client.post(
            "/api/orders/",
            {
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "shipping_info": self.shipping_info(),
                "payment_method": "card",
                "payment_reference": "CARD-REF-123",
            },
            format="json",
        )
        order_id = create_response.data["order"]["id"]

        self.client.force_authenticate(user=self.admin)
        update_response = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "Shipped"},
            format="json",
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["status"], "Shipped")

    def test_non_cod_payment_requires_reference(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/orders/",
            {
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "shipping_info": self.shipping_info(),
                "payment_method": "upi",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Payment reference is required", response.data["error"])

    def test_fifty_users_can_place_orders_without_glitches(self):
        category = Category.objects.create(name="Stress")
        stress_product = Product.objects.create(
            name="Stress Ring",
            description="Load test product",
            price=25,
            stock=100,
            image="https://example.com/stress-ring.jpg",
            category=category,
            type="Silver",
        )

        for index in range(50):
            user = User.objects.create_user(
                email=f"load{index}@example.com",
                name=f"Load User {index}",
                password="password123",
            )
            client = self.client_class()
            client.force_authenticate(user=user)
            response = client.post(
                "/api/orders/",
                {
                    "items": [{"product_id": stress_product.id, "quantity": 1}],
                    "shipping_info": self.shipping_info(str(index)),
                    "payment_method": "cod",
                },
                format="json",
            )
            self.assertEqual(response.status_code, 201)

        self.assertEqual(Order.objects.filter(items__product=stress_product).distinct().count(), 50)
        stress_product.refresh_from_db()
        self.assertEqual(stress_product.stock, 50)
