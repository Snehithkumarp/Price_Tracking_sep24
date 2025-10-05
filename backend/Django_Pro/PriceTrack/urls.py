# -------------------------------
# Django & DRF Imports
# -------------------------------
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
# -------------------------------
# Import Views
# -------------------------------
# Import all view functions and classes for handling requests
from .views import (
    home,
    SignupView,
    LoginView,
    LogoutView,
    RefreshView,
    MeView,
    TrackedProductViewSet,
    ProductViewSet,
    PriceHistoryViewSet,
    DeleteLastRecordsView,
    UserViewSet,
    CustomTokenObtainPairView,
    recently_dropped_products,
    dashboard_stats,
    AdminTrackedProductViewSet,
    AdminPriceHistoryViewSet,
    ProductPriceHistoryView,
)
# PriceAlertViewSet,
# ProductDetailView,
# PriceHistoryListView,
# ProductSearchView,
# -------------------------------
# Router Configuration
# -------------------------------
# DRF DefaultRouter automatically creates routes for ViewSets
router = DefaultRouter()
router.register(r"tracked", TrackedProductViewSet, basename="tracked")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"price-history", PriceHistoryViewSet, basename="price-history")
router.register(r"users", UserViewSet, basename="users")
router.register(r'tracked-products', TrackedProductViewSet, basename='tracked-products')
router.register(r'admin-tracked-products', AdminTrackedProductViewSet, basename='admin-tracked-products')
router.register(r'admin/price-history', AdminPriceHistoryViewSet, basename='admin-price-history')
router.register(r"admin/tracked", AdminTrackedProductViewSet, basename="admin-tracked")

# -------------------------------
# URL Patterns
# -------------------------------
urlpatterns = [
    # ---------- Admin ----------
    path("admin/", admin.site.urls),  # Django admin panel

    # ---------- Home ----------
    path("", home, name="home"),      # Homepage view (accessible at `/`)
    

    # ---------- Authentication ----------
    path("auth/signup/", SignupView.as_view(), name="auth-signup"),   # Register new user
    path("auth/login/", LoginView.as_view(), name="auth-login"),      # User login
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),# Refresh JWT token
    path("auth/me/", MeView.as_view(), name="auth-me"),              # Get current user info
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),  # Logout user

    # JWT (SimpleJWT)
    path("auth/jwt/login/", CustomTokenObtainPairView.as_view(), name="jwt-login"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),

    #------- product-history --------------
    path("api/products/<int:pk>/history/", ProductPriceHistoryView.as_view(), name="product-history"),
    

    # ---------- Delete Records ----------
    path("api/products/delete-last/", DeleteLastRecordsView.as_view(), name="delete-last-1"),
    path("api/products/delete-last/<int:count>/", DeleteLastRecordsView.as_view(), name="delete-last-n"),
    path("products/recently-dropped/", recently_dropped_products, name="recently-dropped"),


    # ---------- Tracked Products (Manual Routes) ----------
    # Regular user endpoints
    path("api/tracked-products/", TrackedProductViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='tracked-products-list'),
    
    path("api/tracked-products/<int:pk>/", TrackedProductViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='tracked-products-detail'),

    # Admin endpoints
    path("api/tracked-products/all/", TrackedProductViewSet.as_view({
        'get': 'all'
    }), name='tracked-products-all'),

    # ---------- Router URLs ----------
    # Include router URLs for ViewSets
    path("", include(router.urls)),       # Root includes router URLs
    path("api/", include(router.urls)),   # API prefix includes router URLs
    path("api/auth/", include(router.urls)), # Auth prefix (not necessary for router but included)
    
    # ---------- Dashboard ----------
    path("dashboard/stats/", dashboard_stats, name="dashboard-stats"),

    # ---------- Products ----------
    # Product-specific views
    # path("api/products/<int:id>/", ProductDetailView.as_view(), name="product-detail"),  # Single product detail
    # path("products/<int:id>/history/", PriceHistoryListView.as_view(), name="price-history"), # Price history
    # path("api/products/search/", ProductSearchView.as_view(), name="product-search"),   # Search products
    

]

