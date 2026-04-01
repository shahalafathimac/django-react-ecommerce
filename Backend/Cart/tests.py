from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from products.models import Category, Product


User = get_user_model()


class CartApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="cartuser@example.com",
            name="Cart User",
            password="password123",
        )
        category = Category.objects.create(name="Ring")
        self.product = Product.objects.create(
            name="Test Ring",
            description="A test ring",
            price=100,
            stock=5,
            image="https://example.com/ring.jpg",
            category=category,
            type="Gold",
        )
        self.client.force_authenticate(user=self.user)

    def test_add_and_fetch_cart(self):
        add_response = self.client.post("/api/cart/add/", {"product_id": self.product.id, "quantity": 2}, format="json")
        self.assertEqual(add_response.status_code, 200)
        self.assertEqual(add_response.data["total_items"], 2)

        cart_response = self.client.get("/api/cart/")
        self.assertEqual(cart_response.status_code, 200)
        self.assertEqual(len(cart_response.data["items"]), 1)
        self.assertEqual(cart_response.data["items"][0]["product_id"], self.product.id)
