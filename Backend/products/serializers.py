from rest_framework import serializers
from .models import Category, Product

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField()

    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        category_name = validated_data.pop('category')
        category, _ = Category.objects.get_or_create(name=category_name.strip())
        return Product.objects.create(category=category, **validated_data)

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', None)
        if category_name:
            category, _ = Category.objects.get_or_create(name=category_name.strip())
            instance.category = category

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category'] = instance.category.name
        return data
