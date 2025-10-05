from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Product, PriceHistory, TrackedProduct
import re

User = get_user_model()

# ---------------------------
# USER SERIALIZERS
# ---------------------------
class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField()
    """
    Serializes basic user info for API responses.
    """
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_admin"]

    def get_is_admin(self, obj):
        # If you use Django’s built-in staff/superuser
        return obj.is_staff or obj.is_superuser

class CustomLoginSerializer(TokenObtainPairSerializer):
    """
    Overrides the default JWT serializer to include user info (with is_admin).
    """
    def validate(self, attrs):
        data = super().validate(attrs)  # authenticate user first
        user = self.user
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_staff or user.is_superuser,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff
        }
        return data
    


class SignupSerializer(serializers.ModelSerializer):
    """
    Handles user signup and password validation.
    - Ensures password is write-only and validated.
    """
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    # 🔹 Username validation
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if not re.match(r"^[a-zA-Z0-9_]+$", value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        return value
    
    # 🔹 Email validation
    def validate_email(self, value):
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value):
            raise serializers.ValidationError("Invalid email format.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_password(self, value):
        """
        Validate password using Django's built-in validators.
        """
        validate_password(value)

        # 🔹 Custom rules
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character (!@#$%^&* etc.).")

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
    product_name = serializers.CharField(source='product.title', read_only=True)  # assumes Product has 'name'
    scraped_at = serializers.DateTimeField(source='date', read_only=True)
    
    class Meta:
        model = PriceHistory
        fields = ["id", "price", "date", "product", "product_name", "scraped_at"]

class ProductListSerializer(serializers.ModelSerializer):
    """
    Simplified product serializer for lists (without price history).
    """
    class Meta:
        model = Product
        fields = ["id", "title", "current_price", "currency", "image_url", "product_url"]

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

# ---------------------------
# TRACKED PRODUCT SERIALIZER
# ---------------------------

class TrackedProductSerializer(serializers.ModelSerializer):
    """
    Serializes products tracked by the user.
    - Uses nested ProductListSerializer for read operations.
    - Allows specifying product via `product_id` on write.
    """
    user = UserSerializer(read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True
    )

    class Meta:
        model = TrackedProduct
        fields = ["id", "user", "product", "product_id", "threshold", "created_at", "active", "repeat_alerts", "alert_price"]
        # read_only_fields = ["id", "product", "created_at"]
        read_only_fields = ["id", "product", "created_at", "user"]

    def create(self, validated_data):
        """
        Ensure tracked product is linked to the authenticated user.
        """
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user
        return super().create(validated_data)
    

# ---------------------------
# PRICE ALERT SERIALIZER (COMMENTED - OPTIONAL)
# ---------------------------

# class PriceAlertSerializer(serializers.ModelSerializer):
#     """
#     Serializes PriceAlert model.
#     """
#     class Meta:
#         model = PriceAlert
#         fields = ["id", "product", "threshold", "active"]
