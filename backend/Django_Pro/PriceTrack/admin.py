from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Product, PriceHistory, TrackedProduct
from django.utils.html import format_html

# ---------------------------
# Custom User Admin
# ---------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin customization for custom User model."""
    list_display = ("username", "email", "is_staff", "is_superuser", "date_joined")
    search_fields = ("username", "email")
    ordering = ("-date_joined",)


class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 0
    readonly_fields = ("price", "date")  # don't allow editing
    ordering = ("-date",)
# ---------------------------
# Product Admin
# ---------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for Product model."""
    # list_display = ("title", "sku", "current_price", "last_checked")
    # search_fields = ("title", "sku")
    # list_filter = ("currency",)
    # ordering = ("-last_checked",)
    list_display = ("title", "sku", "current_price", "last_checked", "product_link")
    search_fields = ("title", "sku")
    list_filter = ("currency",)
    ordering = ("-last_checked",)
    inlines = [PriceHistoryInline]

    # Make product title clickable
    def product_link(self, obj):
        if obj.product_url:
            return format_html('<a href="{}" target="_blank">{}</a>', obj.product_url, obj.title)
        return str(obj.title)
    product_link.short_description = "Product Link"

    # Delete products with no URL
    @admin.action(description="Delete products with no URL")
    def delete_invalid_products(self, request, queryset):
        invalid = queryset.filter(product_url__isnull=True)
        count = invalid.count()
        invalid.delete()
        self.message_user(request, f"{count} invalid products deleted.")

    # Remove duplicates (keep first by ID)
    @admin.action(description="Remove duplicate products (keep first)")
    def remove_duplicates(self, request, queryset):
        seen = set()
        duplicates = []
        for product in queryset.order_by("id"):
            if product.product_url and product.product_url in seen:
                duplicates.append(product.id)
            else:
                if product.product_url:
                    seen.add(product.product_url)
            Product.objects.filter(id__in=duplicates).delete()
            self.message_user(request, f"{len(duplicates)} duplicate products removed.")



# ---------------------------
# Price History Admin
# ---------------------------
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    """Admin for PriceHistory model."""
    list_display = ("product_link", "price", "date")
    search_fields = ("product__title",)
    list_filter = ("date",)
    ordering = ("-date",)

    def product_link(self, obj):
        if obj.product.product_url:
            return format_html('<a href="{}" target="_blank">{}</a>', obj.product.product_url, obj.product.title)
        return obj.product.title
    product_link.short_description = "Product"


# ---------------------------
# Tracked Product Admin
# ---------------------------
@admin.register(TrackedProduct)
class TrackedProductAdmin(admin.ModelAdmin):
    """Admin for TrackedProduct model."""
    list_display = ("user", "product", "threshold", "active", "repeat_alerts", "created_at")
    search_fields = ("user__username", "product__title")
    list_filter = ("active", "repeat_alerts", "created_at")
    ordering = ("-created_at",)

    def product_link(self, obj):
        if obj.product.product_url:
            return format_html('<a href="{}" target="_blank">{}</a>', obj.product.product_url, obj.product.title)
        return obj.product.title
    product_link.short_description = "Product"
