from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()

class AddressSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    street = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zip_code = serializers.CharField(required=False, allow_blank=True)
    zip = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    address  = AddressSerializer(required=False)  

    class Meta:
        model  = User
        fields = ['id', 'name', 'email', 'password', 'address', 'role', 'active']
        read_only_fields = ['id', 'role', 'active']

    def create(self, validated_data):
        address_data = validated_data.pop('address', {})
        user = User.objects.create_user(
            email    = validated_data['email'],
            name     = validated_data['name'],
            password = validated_data['password'],
            role     = 'user',
            active   = True,
            
            street   = address_data.get('street', ''),
            city     = address_data.get('city', ''),
            state    = address_data.get('state', ''),
            zip_code = address_data.get('zip_code') or address_data.get('zip', ''),
            country  = address_data.get('country', ''),
            address  = address_data,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'name', 'email', 'role',
            'active', 'address', 'date_joined'
        ]

    def get_address(self, obj):
        if obj.address:
            return obj.address
        return {
            "street": obj.street or "",
            "city": obj.city or "",
            "state": obj.state or "",
            "zip_code": obj.zip_code or "",
            "country": obj.country or "",
        }


class UpdateProfileSerializer(serializers.ModelSerializer):
    address  = AddressSerializer(required=False)

    class Meta:
        model  = User
        fields = ['name', 'address']

    def update(self, instance, validated_data):
        address_data = validated_data.pop('address', {})
        instance.name = validated_data.get('name', instance.name)

        if address_data:
            instance.address = address_data
            instance.street = (
                address_data.get('street')
                or address_data.get('address')
                or instance.street
            )
            instance.city = address_data.get('city', instance.city)
            instance.state = address_data.get('state', instance.state)
            instance.zip_code = (
                address_data.get('zip_code')
                or address_data.get('zip')
                or instance.zip_code
            )
            instance.country = address_data.get('country', instance.country)

        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    address = AddressSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'password', 'role', 'active',
            'address', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password')
        address = validated_data.get('address', {})
        return User.objects.create_user(
            password=password,
            street=address.get('street') or address.get('address', ''),
            city=address.get('city', ''),
            state=address.get('state', ''),
            zip_code=address.get('zip_code') or address.get('zip', ''),
            country=address.get('country', ''),
            **validated_data,
        )

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        address = validated_data.pop('address', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if address is not None:
            instance.address = address
            instance.street = address.get('street') or address.get('address', instance.street)
            instance.city = address.get('city', instance.city)
            instance.state = address.get('state', instance.state)
            instance.zip_code = address.get('zip_code') or address.get('zip', instance.zip_code)
            instance.country = address.get('country', instance.country)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
