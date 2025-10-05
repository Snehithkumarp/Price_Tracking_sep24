from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# ---------------------------
# Custom User Model
# ---------------------------
class User(AbstractUser):
    """
    Extends Django's AbstractUser.
    Enforces unique email for each user.
    """
    email = models.EmailField(unique=True)
    REQUIRED_FIELDS = ["email"]  # Ensures email is required on user creation

    def __str__(self):
        return self.username


# ---------------------------
# Product Model
# ---------------------------
class Product(models.Model):
    """
    Represents a product to track prices.
    """
    title = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, null=True, blank=True, db_index=True)  # Product identifier
    product_url = models.URLField(max_length=1024, unique=True, null=True, blank=True)  # Product page URL
    affiliate_url = models.URLField(max_length=1024, blank=True, null=True)  # Optional affiliate link
    image_url = models.URLField(max_length=1024, null=True, blank=True)  # Product image
    currency = models.CharField(max_length=12, default="INR")  # Currency code
    current_price = models.DecimalField(max_digits=12, decimal_places=2)  # Latest price
    last_checked = models.DateTimeField(auto_now=True)  # Auto-update on every save

    def __str__(self):
        return f"{self.title} ({self.sku or 'no-sku'})"


# ---------------------------
# Price History Model
# ---------------------------
class PriceHistory(models.Model):
    """
    Stores historical prices for a product.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="history")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)  # Timestamp when the price was recorded

    def __str__(self):
        return f"{self.product} - {self.price} at {self.date}"

    class Meta:
        ordering = ["-date"]


# ---------------------------
# Tracked Product Model
# ---------------------------
class TrackedProduct(models.Model):
    """
    Tracks which products a user is monitoring with alert functionality.
    """
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="tracked_products")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="tracked_by")
    nickname = models.CharField(max_length=150, blank=True, null=True)  # Optional name for product
    created_at = models.DateTimeField(auto_now_add=True)
    threshold = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)  # whether alert is still active
    alert_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=None)
    repeat_alerts = models.BooleanField(default=False)

    class Meta:
        unique_together = ("user", "product")  # Prevent duplicate tracking
        ordering = ("-created_at",)  # Latest tracked products first

    def __str__(self):
        return f"{self.user.username} -> {self.product.title} @ {self.threshold or 'no-threshold'}"


# ---------------------------
# Price Alert Model (Commented - Optional)
# ---------------------------
# class PriceAlert(models.Model):
#     """
#     Alerts user when product price crosses a threshold.
#     """
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
#     product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="alerts")
#     threshold = models.DecimalField(max_digits=12, decimal_places=2)
#     active = models.BooleanField(default=True)
#
#     def __str__(self):
#         return f"{self.user.username} → {self.product.title} @ {self.threshold}"