# -------------------------------
# Django & DRF Imports
# -------------------------------
from rest_framework.routers import DefaultRouter  # For automatic URL routing of ViewSets
from django.urls import path, include               # Path routing and including other URL configs
from django.contrib import admin                    # Django admin site

# -------------------------------
# Import Views
# -------------------------------
# Import all view functions and classes for handling requests
from .views import (
    home,
    ProductDetailView,
    PriceHistoryListView,
    SignupView,
    LoginView,
    RefreshView,
    MeView,
    LogoutView,
    TrackedProductViewSet,
    ProductSearchView,
    ProductViewSet,
    DeleteLastRecordsView
)
# PriceAlertViewSet,
# -------------------------------
# Router Configuration
# -------------------------------
# DRF DefaultRouter automatically creates routes for ViewSets
router = DefaultRouter()
#router.register(r"alerts", PriceAlertViewSet, basename="alerts")       # /alerts/ -> CRUD operations for price alerts
router.register(r"tracked", TrackedProductViewSet, basename="tracked") # /tracked/ -> CRUD for user's tracked products
router.register(r"products", ProductViewSet, basename="products")      # /products/ -> CRUD for products

# -------------------------------
# URL Patterns
# -------------------------------
urlpatterns = [
    # ---------- Admin ----------
    path("admin/", admin.site.urls),  # Django admin panel

    # ---------- Home ----------
    path("", home, name="home"),      # Homepage view (accessible at `/`)

    # ---------- Authentication ----------
    # Auth endpoints using class-based views
    path("auth/signup/", SignupView.as_view(), name="auth-signup"),   # Register new user
    path("auth/login/", LoginView.as_view(), name="auth-login"),      # User login
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),# Refresh JWT token
    path("auth/me/", MeView.as_view(), name="auth-me"),              # Get current user info
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),  # Logout user

    

    # ---------- Products ----------
    # Product-specific views
    path("api/products/<int:id>/", ProductDetailView.as_view(), name="product-detail"),  # Single product detail
    path("products/<int:id>/history/", PriceHistoryListView.as_view(), name="price-history"), # Price history
    path("api/products/search/", ProductSearchView.as_view(), name="product-search"),   # Search products

       # ---------- Delete Records ----------
    path("api/products/delete-last/", DeleteLastRecordsView.as_view(), name="delete-last-1"),
    path("api/products/delete-last/<int:count>/", DeleteLastRecordsView.as_view(), name="delete-last-n"),

    # ---------- Router URLs ----------
    # Include router URLs for ViewSets
    path("", include(router.urls)),       # Root includes router URLs
    path("api/", include(router.urls)),   # API prefix includes router URLs
    path("api/auth/", include(router.urls)), # Auth prefix (not necessary for router but included)

 


]

