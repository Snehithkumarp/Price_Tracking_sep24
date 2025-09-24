# ---------------------------------------------------------
# Imports
# ---------------------------------------------------------
import logging
import re
from decimal import Decimal
from urllib.parse import urlparse

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Q

from rest_framework import generics, permissions, viewsets, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
from .models import Product, PriceHistory, TrackedProduct
# PriceAlert
from .serializers import (
    ProductSerializer,
    PriceHistorySerializer,
    TrackedProductSerializer,
    UserSerializer,
    SignupSerializer,
)
# PriceAlertSerializer,
from .auth_serializers import LoginSerializer

# Scraper functions
from PriceTrack.tasks.scraper import scrape_amazon_search, scrape_flipkart_search, scrape_product

logger = logging.getLogger(__name__)
User = get_user_model()

# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------
def home(request):
    """Simple API home endpoint."""
    return JsonResponse({"message": "Welcome to Price Tracker API"})

# ---------------------------------------------------------
# PRODUCT VIEWS
# ---------------------------------------------------------
class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve details for a single product by ID."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "id"


class PriceHistoryListView(generics.ListAPIView):
    """List price history for a specific product."""
    serializer_class = PriceHistorySerializer

    def get_queryset(self):
        product_id = self.kwargs["id"]
        return PriceHistory.objects.filter(product_id=product_id).order_by("-date")


class ProductListView(generics.ListAPIView):
    """List all products with optional search."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]

# ---------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------
class SignupView(generics.CreateAPIView):
    """User signup endpoint with JWT token return."""
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        user = User.objects.get(id=resp.data["id"]) if "id" in resp.data else None
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        return resp


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
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
# PRICE ALERTS
# ---------------------------------------------------------
# class PriceAlertViewSet(viewsets.ModelViewSet):
#     """CRUD for price alerts."""
#     queryset = PriceAlert.objects.all()
#     serializer_class = PriceAlertSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)

# ---------------------------------------------------------
# TRACKED PRODUCTS
# ---------------------------------------------------------
class TrackedProductViewSet(viewsets.ModelViewSet):
    """CRUD for user's tracked products with alert feature."""
    serializer_class = TrackedProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrackedProduct.objects.filter(user=self.request.user).select_related("product")

    # def perform_create(self, serializer):
    #     print("🚨 perform_create called!")
    #     serializer.save(user=self.request.user)

    def perform_create(self, serializer):
        try:
            print("🚨 perform_create called!")
            serializer.save(user=self.request.user)
        except IntegrityError:
            # Return a clean error response if duplicate tracked product
            raise serializer.ValidationError("You are already tracking this product.")

    # @action(detail=True, methods=["post"], url_path="set_alert", url_name="set_alert")
    # def set_alert(self, request, pk=None):
    #     """Create or update a price alert for a tracked product."""
    #     instance = self.get_object()
    #     threshold = request.data.get("threshold")
    #     if threshold is None:
    #         return Response({"detail": "threshold required"}, status=status.HTTP_400_BAD_REQUEST)

    #     alert, _ = TrackedProduct.objects.update_or_create(
    #         user=request.user,
    #         product=instance.product,
    #         defaults={"threshold": threshold, "active": True},
    #     )
    #     return Response({"detail": "alert set", "alert_id": alert.id})
    
    @action(detail=True, methods=["post"], url_path="set-alert", url_name="set_alert")
    def set_alert(self, request, pk=None):
        """Create or update a price alert for a tracked product."""
        instance = self.get_object()
        threshold = request.data.get("threshold")
        # if threshold is None:
        #     return Response({"detail": "threshold required"}, status=status.HTTP_400_BAD_REQUEST)
        instance.threshold = threshold
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)



        # # alert, _ = TrackedProduct.objects.update_or_create(
        # #     user=request.user,
        # #     product=instance.product,
            
        # #     defaults={"threshold": threshold, "active": True},
        # # )
        # instance.threshold = threshold
        # #instance.active = True
        # instance.save()
        # # ✅ Return updated tracked product, not just a message
        # serializer = self.get_serializer(instance)
        # return Response(serializer.data, status=status.HTTP_200_OK)
        
        # try:
        #     threshold = float(request.data.get("threshold"))
        # except (TypeError, ValueError):
        #     return Response(
        #         {"detail": "Valid numeric threshold required"},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        # ✅ Save into alert_price (or threshold if that's your model field)
        instance.alert_price = threshold
        instance.save(update_fields=["alert_price"])

        # ✅ Return updated tracked product
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

        
        #return Response({"detail": "alert set", "alert_id": alert.id})


# ---------------------------------------------------------
# PRODUCT SEARCH
# ---------------------------------------------------------
class ProductSearchView(APIView):
    """Search products across Amazon and Flipkart."""
    def get(self, request):
        query = request.GET.get("q")
        if not query:
            return Response({"error": "Search query required"}, status=400)

        amazon_results = scrape_amazon_search(query)
        flipkart_results = scrape_flipkart_search(query)

        results = amazon_results + flipkart_results
        return Response(results)

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
# PRODUCT VIEWSET
# ---------------------------------------------------------
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for products with URL & keyword search."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = []  # Disable DRF search filter to handle custom search logic

    def list(self, request, *args, **kwargs):
        """Custom listing with URL and keyword search."""
        search = request.query_params.get("search")
        logger.debug("➡️ ProductViewSet search param: %s", search)

        if not search:
            return super().list(request, *args, **kwargs)

        # ---------- PRODUCT URL SEARCH ----------
        if is_product_url(search):
            logger.debug("🔎 Looks like a product URL")

            # Check database first
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

            # Convert price safely
            raw_price = str(data.get("price"))
            clean_price = re.sub(r"[^\d.]", "", raw_price)
            try:
                price = Decimal(clean_price)
            except Exception:
                return Response({"error": f"Invalid price format: {raw_price}"}, status=400)

            # Save product
            product = Product.objects.create(
                title=data.get("name") or "Unknown",
                current_price=price,
                currency="₹",
                image_url=data.get("image"),
                product_url=search,
            )

            # Save price history
            PriceHistory.objects.create(product=product, price=price)

            return Response(self.get_serializer(product).data, status=201)

        # ---------- KEYWORD SEARCH ----------
        logger.debug("🔍 Keyword search: %s", search)

        # First, search DB
        db_matches = Product.objects.filter(title__icontains=search)
        if db_matches.exists():
            logger.debug("✅ Found %s products in DB", db_matches.count())
            return Response(self.get_serializer(db_matches, many=True).data)

        # If no DB results, fall back to scraping
        results = []
        try:
            results.extend(scrape_amazon_search(search) or [])
        except Exception as e:
            logger.exception("Amazon search failed")
        try:
            results.extend(scrape_flipkart_search(search) or [])
        except Exception as e:
            logger.exception("Flipkart search failed")

        return Response({"search_results": results})


class DeleteLastRecordsView(APIView):
    """
    Delete the last N Product records.
    Default = 1 if count not passed.
    """
    def delete(self, request, count=None, *args, **kwargs):
        # Default to 1 if no number given
        count = int(count) if count else 1  

        qs = Product.objects.order_by("-id")[:count]
        deleted_count = qs.count()
        qs.delete()

        return Response(
            {"message": f"Deleted {deleted_count} record(s)"},
            status=status.HTTP_200_OK,
        )