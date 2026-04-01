from rest_framework.test import APITestCase
from products.models import Category, Product


class ProductApiTests(APITestCase):
    def setUp(self):
        ring = Category.objects.create(name="Ring")
        chain = Category.objects.create(name="Chain")

        for index in range(15):
            Product.objects.create(
                name=f"Ring {index}",
                description="Test ring",
                price=100 + index,
                stock=10 + index,
                image=f"https://example.com/ring-{index}.jpg",
                category=ring if index < 10 else chain,
                type="Gold" if index % 2 == 0 else "Silver",
            )

    def test_product_list_is_paginated(self):
        response = self.client.get("/api/products/?page=1&page_size=5")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 15)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["page"], 1)
        self.assertEqual(response.data["total_pages"], 3)

    def test_product_filters_use_backend_logic(self):
        response = self.client.get("/api/products/?category=Ring&search=Ring&type=Gold&page_size=20")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["results"])
        for product in response.data["results"]:
            self.assertEqual(product["category"], "Ring")
            self.assertEqual(product["type"], "Gold")
