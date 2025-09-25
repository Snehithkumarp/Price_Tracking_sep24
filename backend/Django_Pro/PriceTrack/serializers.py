from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Product, PriceHistory,  TrackedProduct  
# PriceAlert

User = get_user_model()

# ---------------------------
# USER SERIALIZERS
# ---------------------------

class UserSerializer(serializers.ModelSerializer):
    """
    Serializes basic user info for API responses.
    """
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class SignupSerializer(serializers.ModelSerializer):
    """
    Handles user signup and password validation.
    - Ensures password is write-only and validated.
    """
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def validate_password(self, value):
        """
        Validate password using Django's built-in validators.
        """
        validate_password(value)
        return value

    def create(self, validated_data):
        """
        Create user and hash password.
        """
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ---------------------------
# PRODUCT & PRICE SERIALIZERS
# ---------------------------

class PriceHistorySerializer(serializers.ModelSerializer):
    """
    Serializes price history for a product.
    """
    class Meta:
        model = PriceHistory
        fields = ["id", "price", "date"]


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializes product data along with its price history.
    """
    history = PriceHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "sku",
            "product_url",
            "affiliate_url",
            "image_url",
            "currency",
            "current_price",
            "last_checked",
            "history",
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """
    Simplified product serializer for lists (without price history).
    """
    class Meta:
        model = Product
        fields = ["id", "title", "current_price", "currency", "image_url", "product_url"]


# ---------------------------
# PRICE ALERT SERIALIZER
# ---------------------------

# class PriceAlertSerializer(serializers.ModelSerializer):
#     """
#     Serializes PriceAlert model.
#     """
#     class Meta:
#         model = PriceAlert
#         fields = ["id", "product", "threshold", "active"]


# ---------------------------
# TRACKED PRODUCT SERIALIZER
# ---------------------------

class TrackedProductSerializer(serializers.ModelSerializer):
    """
    Serializes products tracked by the user.
    - Uses nested ProductListSerializer for read operations.
    - Allows specifying product via `product_id` on write.
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True
    )

    class Meta:
        model = TrackedProduct
        fields = ["id", "product", "product_id", "nickname", "created_at", "threshold", "active", "repeat_alerts"]
        # read_only_fields = ["id", "product", "created_at"]
        read_only_fields = ['user']

    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    def create(self, validated_data):
        """
        Create a tracked product instance.
        """
        return super().create(validated_data)


