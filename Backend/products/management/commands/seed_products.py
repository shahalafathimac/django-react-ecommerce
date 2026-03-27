import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from products.models import Category, Product


class Command(BaseCommand):
    help = "Seed products from db.json into the database."

    def handle(self, *args, **options):
        file_path = Path(settings.BASE_DIR) / 'db.json'

        with file_path.open(encoding='utf-8') as file:
            data = json.load(file)

        created_count = 0
        updated_count = 0

        for item in data.get('ornaments', []):
            category, _ = Category.objects.get_or_create(name=item['category'].strip())
            _, created = Product.objects.update_or_create(
                id=int(item['id']),
                defaults={
                    'name': item['name'],
                    'description': item['description'],
                    'price': item['price'],
                    'stock': item['stock'],
                    'image': item['image'],
                    'category': category,
                    'type': item.get('type', 'Jewelry'),
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded products successfully. Created: {created_count}, Updated: {updated_count}'
            )
        )
