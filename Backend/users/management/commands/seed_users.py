import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from Cart.models import Cart, CartItem
from products.models import Product
from users.models import User


class Command(BaseCommand):
    help = "Seed users from db.json into the database."

    @transaction.atomic
    def handle(self, *args, **options):
        file_path = Path(settings.BASE_DIR) / 'db.json'

        with file_path.open(encoding='utf-8') as file:
            data = json.load(file)

        created_count = 0
        updated_count = 0

        for item in data.get('users', []):
            email = item.get('email')
            if not email:
                continue

            defaults = {
                'name': item.get('name', ''),
                'role': item.get('role', 'user'),
                'active': item.get('active', True),
                'address': item.get('address', {}),
                'order': item.get('order', []),
                'street': item.get('address', {}).get('address', ''),
                'city': item.get('address', {}).get('city', ''),
                'state': item.get('address', {}).get('state', ''),
                'zip_code': item.get('address', {}).get('zip', ''),
                'country': item.get('address', {}).get('country', ''),
                'is_staff': item.get('role') == 'admin',
                'is_superuser': item.get('role') == 'admin',
            }

            user = User.objects.filter(email=email).first()

            if user:
                for field, value in defaults.items():
                    setattr(user, field, value)
                if item.get('password'):
                    user.set_password(item['password'])
                user.save()
                updated_count += 1
            else:
                password = item.get('password') or 'changeme123'
                user = User.objects.create_user(
                    email=email,
                    name=defaults['name'],
                    password=password,
                    role=defaults['role'],
                    active=defaults['active'],
                    address=defaults['address'],
                    order=defaults['order'],
                    street=defaults['street'],
                    city=defaults['city'],
                    state=defaults['state'],
                    zip_code=defaults['zip_code'],
                    country=defaults['country'],
                    is_staff=defaults['is_staff'],
                    is_superuser=defaults['is_superuser'],
                )
                created_count += 1

            cart = Cart.objects.get_or_create(user=user)[0]
            cart.items.all().delete()
            for cart_item in item.get('cart', []):
                product = Product.objects.filter(pk=int(cart_item['id'])).first()
                if not product:
                    continue
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=cart_item.get('quantity', 1),
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded users successfully. Created: {created_count}, Updated: {updated_count}'
            )
        )
