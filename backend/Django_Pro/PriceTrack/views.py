# ---------------------------------------------------------
# Imports
# ---------------------------------------------------------
import logging
import re
from decimal import Decimal
from urllib.parse import urlparse

from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now, timedelta
from rest_framework import generics, permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser

from .models import Product, PriceHistory, TrackedProduct
from .serializers import (
    ProductSerializer,
    PriceHistorySerializer,
    TrackedProductSerializer,
    UserSerializer,
    SignupSerializer,
    CustomLoginSerializer,
)

# Scraper functions
from PriceTrack.tasks.scraper import scrape_amazon_search, scrape_flipkart_search, scrape_product

logger = logging.getLogger(__name__)
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """
    Returns total counts for Products, Users, and Tracked Items
    """
    try:
        data = {
            'products': Product.objects.count(),
            'users': User.objects.count(),
            'tracked_items': TrackedProduct.objects.count(),
        }
        return Response(data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------
def home(request):
    """Simple API home endpoint."""
    return JsonResponse({"message": "Welcome to Price Tracker API"})
# ---------------------------------------------------------
# USER MANAGEMENT
# ---------------------------------------------------------
class UserViewSet(viewsets.ModelViewSet):
    """Admin-only view for managing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # only admin users can access

# -------------------------------
# Custom Token Obtain Pair View
# -------------------------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user  # Get user from validated data
        data = serializer.validated_data
        return Response({
            # "refresh": str(serializer.validated_data["refresh"]),
            # "access": str(serializer.validated_data["access"]),
            # "user": {
            #     "id": user.id,
            #     "username": user.username,
            #     "email": user.email,
            #     "first_name": user.first_name,
            #     "last_name": user.last_name,
            #     "is_admin": user.is_staff or user.is_superuser,  # ✅ Add this
            # }
            "refresh": data["refresh"],
            "access": data["access"],
            "user": UserSerializer(user).data,
        })
# ---------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------
class SignupView(generics.CreateAPIView):
    """User signup endpoint with JWT token return."""
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        user = User.objects.filter(id=resp.data.get("id")).first()
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        return resp


class LoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer
    permission_classes = [permissions.AllowAny]




class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """Return current authenticated user info."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """Blacklist refresh token to log out."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = request.data.get("refresh")
            if not token:
                return Response({"detail": "refresh token required"}, status=400)
            RefreshToken(token).blacklist()
            return Response({"detail": "logged out"})
        except Exception:
            return Response({"detail": "invalid token"}, status=400)

# ---------------------------------------------------------
# PRICE HISTORY
# ---------------------------------------------------------
class PriceHistoryViewSet(viewsets.ModelViewSet):
    """View price histories. Admins see all; users see only their products."""
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all, users only see their own product histories
        if self.request.user.is_superuser:
            return PriceHistory.objects.all()
        return PriceHistory.objects.filter(product__trackedproduct__user=self.request.user)

class ProductPriceHistoryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        histories = PriceHistory.objects.filter(product__id=pk).order_by("-date")
        serializer = PriceHistorySerializer(histories, many=True)
        return Response(serializer.data)
    
# ============================
# Admin Price History (all users)
# ============================
class AdminPriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PriceHistory.objects.all().select_related("product")
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.IsAdminUser]

# ---------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------
def is_product_url(url: str) -> bool:
    """Check if a URL belongs to Amazon or Flipkart."""
    try:
        host = urlparse(url).netloc.lower()
        return "amazon." in host or "flipkart.com" in host
    except Exception:
        return False
    
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for products with URL & keyword search."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


    def list(self, request, *args, **kwargs):
        search = request.query_params.get("search")
        if not search:
            return super().list(request, *args, **kwargs)

        # ---------- PRODUCT URL SEARCH ----------
        if is_product_url(search):
            product = Product.objects.filter(product_url=search).first()
            if product:
                return Response(self.get_serializer(product).data)

            # Scrape product if not in DB
            try:
                data = scrape_product(search)
            except Exception as e:
                logger.exception("Scrape failed")
                return Response({"error": str(e)}, status=500)

            if not data or not data.get("price"):
                return Response({"error": "Failed to scrape product"}, status=400)

            # Parse price
            raw_price = str(data.get("price"))
            clean_price = re.sub(r"[^\d.]", "", raw_price)
            try:
                price = Decimal(clean_price)
            except Exception:
                return Response({"error": f"Invalid price format: {raw_price}"}, status=400)

            product = Product.objects.create(
                title=data.get("name") or "Unknown",
                current_price=price,
                currency="₹",
                image_url=data.get("image"),
                product_url=search,
            )
            PriceHistory.objects.create(product=product, price=price)

            return Response(self.get_serializer(product).data, status=201)

        # ---------- KEYWORD SEARCH ----------
        db_matches = Product.objects.filter(title__icontains=search)
        if db_matches.exists():
            return Response(self.get_serializer(db_matches, many=True).data)

        # Scrape if not found in DB
        results = []
        try:
            results.extend(scrape_amazon_search(search) or [])
        except Exception:
            logger.exception("Amazon search failed")
        try:
            results.extend(scrape_flipkart_search(search) or [])
        except Exception:
            logger.exception("Flipkart search failed")

        return Response({"search_results": results})


class ProductSearchView(APIView):
    """Search products across Amazon and Flipkart (keyword only)."""
    def get(self, request):
        query = request.GET.get("q")
        if not query:
            return Response({"error": "Search query required"}, status=400)

        results = []
        try:
            results.extend(scrape_amazon_search(query) or [])
        except Exception:
            logger.exception("Amazon search failed")
        try:
            results.extend(scrape_flipkart_search(query) or [])
        except Exception:
            logger.exception("Flipkart search failed")

        return Response(results)





# ---------------------------------------------------------
# TRACKED PRODUCTS
# ---------------------------------------------------------
class TrackedProductViewSet(viewsets.ModelViewSet):
    """CRUD for user's tracked products with alert feature."""
    queryset = TrackedProduct.objects.all()
    serializer_class = TrackedProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # if self.request.user.is_superuser:
        #     return TrackedProduct.objects.all()
        return TrackedProduct.objects.filter(user=self.request.user).select_related("product")
    
    @action(detail=True, methods=["post"], url_path="set-alert", url_name="set_alert")
    def set_alert(self, request, pk=None):
        """Create or update a price alert for a tracked product."""
        instance = self.get_object()
        threshold = request.data.get("threshold")
        if threshold is None:
            return Response({"detail": "threshold required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance.threshold = Decimal(threshold)
        except Exception:
            return Response({"detail": "Invalid threshold value"}, status=400)

        instance.save(update_fields=["threshold"])
        return Response(self.get_serializer(instance).data, status=200)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def all(self, request):
        """Admin-only endpoint to view all tracked products."""
        qs = TrackedProduct.objects.all().select_related("product", "user")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    

    
    def perform_create(self, serializer):
        # user = self.request.user
        # try:
        #     serializer.save(user=self.request.user)
        # except IntegrityError:
        #     # Return a clean error response if duplicate tracked product
        #     raise serializer.ValidationError("You are already tracking this product.")
        # serializer.save(user=user)
        user = self.request.user
        product = serializer.validated_data.get("product")
        
        if TrackedProduct.objects.filter(user=user, product=product).exists():
            raise ValidationError({"detail": "Price alert already exists for this product."})
        
        serializer.save(user=user)
    



class AdminTrackedProductViewSet(viewsets.ModelViewSet):
    """Admin view to see all tracked products"""
    queryset = TrackedProduct.objects.all().select_related("product", "user")
    serializer_class = TrackedProductSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
    def all(self, request):
        """Admin-only endpoint to view all tracked products."""
        qs = TrackedProduct.objects.all().select_related("product", "user")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

# ---------------------------------------------------------
# HELPER FUNCTION
# ---------------------------------------------------------
def is_product_url(url: str) -> bool:
    """Check if a URL belongs to Amazon or Flipkart."""
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        return "amazon." in host or "flipkart.com" in host
    except Exception:
        return False
# ---------------------------------------------------------
# CLEANUP UTILS
# ---------------------------------------------------------
class DeleteLastRecordsView(APIView):
    """Delete the last N Product records (default = 1)."""
    def delete(self, request, count=None, *args, **kwargs):
        count = int(count) if count else 1
        qs = Product.objects.order_by("-id")[:count]
        deleted_count = qs.count()
        qs.delete()
        return Response({"message": f"Deleted {deleted_count} record(s)"}, status=200)

# ---------------------------------------------------------
# Recently Dropped
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def recently_dropped_products(request):
    """
    Returns products that had a price drop compared to their previous price.
    """
    dropped_products = []

    for product in Product.objects.all():
        history = PriceHistory.objects.filter(product=product).order_by("-date")
        if history.count() >= 2:
            latest = history[0].price
            previous = history[1].price
            if latest < previous:
                dropped_products.append(product)

    if not dropped_products:
        return Response({"message": "No recent price drops."})

    serializer = ProductSerializer(dropped_products, many=True)
    return Response(serializer.data)


