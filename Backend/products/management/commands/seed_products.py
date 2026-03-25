import json
from django.core.management.base import BaseCommand
from products.models import Product,Category
import os
from django.conf import settings

file_path = os.path.join(settings.BASE_DIR, 'db.json')

class Command(BaseCommand):
    help = "seed products from JSON"

    def handle(self, *args, **kwargs):
        with open(file_path, 'r') as f:
            data = json.load(f)

        ornaments = data.get('ornaments', [])
        
        for item in ornaments:
            category_name = item.get('category')

            category, _ = Category.objects.get_or_create(name=category_name)

            Product.objects.create(
                name = item.get('name'),
                category = category,
                type = item.get('type'),
                price = item.get('price'),
                description = item.get('description'),
                image = item.get('image'),
                stock = item.get('stock')
            )

        self.stdout.write(self.style.SUCCESS("products seeded successfully!"))