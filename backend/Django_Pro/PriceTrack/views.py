# # ---------------------------------------------------------
# # Imports
# # ---------------------------------------------------------
# import logging
# import re
# from decimal import Decimal
# from urllib.parse import urlparse

# from django.http import JsonResponse
# from django.contrib.auth import get_user_model
# from rest_framework.decorators import api_view, permission_classes
# from django.utils.timezone import now, timedelta
# from rest_framework import generics, permissions, viewsets, status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.decorators import action
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.exceptions import ValidationError
# from rest_framework.permissions import IsAdminUser

# from .models import Product, PriceHistory, TrackedProduct
# from .serializers import (
#     ProductSerializer,
#     PriceHistorySerializer,
#     TrackedProductSerializer,
#     UserSerializer,
#     SignupSerializer,
#     CustomLoginSerializer,
# )

# # Scraper functions
# from PriceTrack.tasks.scraper import scrape_amazon_search, scrape_flipkart_search, scrape_product

# logger = logging.getLogger(__name__)
# User = get_user_model()

# @api_view(['GET'])
# @permission_classes([IsAdminUser])
# def dashboard_stats(request):
#     """
#     Returns total counts for Products, Users, and Tracked Items
#     """
#     try:
#         total_products = Product.objects.count()
#         total_users = User.objects.count()
#         total_tracked = TrackedProduct.objects.count()  # all tracked products
#         # admin_tracked = TrackedProduct.objects.filter(user__is_staff=True).count()  # tracked by admins
#         # non_admin_tracked = TrackedProduct.objects.filter(user__is_staff=False).count()  # tracked by regular users

#         data = {
#             'products': total_products,
#             'users': total_users,
#             'tracked_items': total_tracked,
#             # 'admin_tracked_items': admin_tracked,
#             # 'user_tracked_items': non_admin_tracked,
#         }
#         return Response(data, status=200)
#     except Exception as e:
#         return Response({'error': str(e)}, status=500)


# # ---------------------------------------------------------
# # HOME
# # ---------------------------------------------------------
# def home(request):
#     """Simple API home endpoint."""
#     return JsonResponse({"message": "Welcome to Price Tracker API"})
# # ---------------------------------------------------------
# # USER MANAGEMENT
# # ---------------------------------------------------------
# class UserViewSet(viewsets.ModelViewSet):
#     """Admin-only view for managing users"""
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAdminUser]  # only admin users can access

# # -------------------------------
# # Custom Token Obtain Pair View
# # -------------------------------
# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomLoginSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.user  # Get user from validated data
#         data = serializer.validated_data
#         return Response({
#             # "refresh": str(serializer.validated_data["refresh"]),
#             # "access": str(serializer.validated_data["access"]),
#             # "user": {
#             #     "id": user.id,
#             #     "username": user.username,
#             #     "email": user.email,
#             #     "first_name": user.first_name,
#             #     "last_name": user.last_name,
#             #     "is_admin": user.is_staff or user.is_superuser,  # ✅ Add this
#             # }
#             "refresh": data["refresh"],
#             "access": data["access"],
#             "user": UserSerializer(user).data,
#         })
# # ---------------------------------------------------------
# # AUTHENTICATION
# # ---------------------------------------------------------
# class SignupView(generics.CreateAPIView):
#     """User signup endpoint with JWT token return."""
#     queryset = User.objects.all()
#     serializer_class = SignupSerializer
#     permission_classes = [permissions.AllowAny]

#     def create(self, request, *args, **kwargs):
#         resp = super().create(request, *args, **kwargs)
#         user = User.objects.filter(id=resp.data.get("id")).first()
#         if user:
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 "user": UserSerializer(user).data,
#                 "access": str(refresh.access_token),
#                 "refresh": str(refresh),
#             })
#         return resp


# class LoginView(TokenObtainPairView):
#     serializer_class = CustomLoginSerializer
#     permission_classes = [permissions.AllowAny]




# class RefreshView(TokenRefreshView):
#     permission_classes = [permissions.AllowAny]


# class MeView(APIView):
#     """Return current authenticated user info."""
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         return Response(UserSerializer(request.user).data)


# class LogoutView(APIView):
#     """Blacklist refresh token to log out."""
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         try:
#             token = request.data.get("refresh")
#             if not token:
#                 return Response({"detail": "refresh token required"}, status=400)
#             RefreshToken(token).blacklist()
#             return Response({"detail": "logged out"})
#         except Exception:
#             return Response({"detail": "invalid token"}, status=400)

# # ---------------------------------------------------------
# # PRICE HISTORY
# # ---------------------------------------------------------
# class PriceHistoryViewSet(viewsets.ModelViewSet):
#     """View price histories. Admins see all; users see only their products."""
#     queryset = PriceHistory.objects.all()
#     serializer_class = PriceHistorySerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         # Admins see all, users only see their own product histories
#         if self.request.user.is_superuser:
#             return PriceHistory.objects.all()
#         return PriceHistory.objects.filter(product__trackedproduct__user=self.request.user)

# class ProductPriceHistoryView(APIView):
#     permission_classes = [IsAdminUser]

#     def get(self, request, pk):
#         histories = PriceHistory.objects.filter(product__id=pk).order_by("-date")
#         serializer = PriceHistorySerializer(histories, many=True)
#         return Response(serializer.data)
    
# # ============================
# # Admin Price History (all users)
# # ============================
# class AdminPriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = PriceHistory.objects.all().select_related("product")
#     serializer_class = PriceHistorySerializer
#     permission_classes = [permissions.IsAdminUser]

# # ---------------------------------------------------------
# # PRODUCTS
# # ---------------------------------------------------------
# def is_product_url(url: str) -> bool:
#     """Check if a URL belongs to Amazon or Flipkart."""
#     try:
#         host = urlparse(url).netloc.lower()
#         return "amazon." in host or "flipkart.com" in host
#     except Exception:
#         return False
    
# class ProductViewSet(viewsets.ModelViewSet):
#     """Read-only viewset for products with URL & keyword search."""
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     # permission_classes = [permissions.AllowAny]
    
#     def get_permissions(self):
#         # Allow everyone to view (GET)
#         if self.action in ['list', 'retrieve']:
#             return [permissions.AllowAny()]
#         # Only admins can delete, update, or create
#         return [permissions.IsAdminUser()]

#     def destroy(self, request, *args, **kwargs):
#         """Delete a product safely."""
#         try:
#             instance = self.get_object()
#             self.perform_destroy(instance)
#             return Response({"message": "Product deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except Product.DoesNotExist:
#             return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             import traceback
#             print("DELETE ERROR:", traceback.format_exc())  # log for debugging
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#     def list(self, request, *args, **kwargs):
#         search = request.query_params.get("search")
#         if not search:
#             return super().list(request, *args, **kwargs)

#         # ---------- PRODUCT URL SEARCH ----------
#         if is_product_url(search):
#             product = Product.objects.filter(product_url=search).first()
#             if product:
#                 return Response(self.get_serializer(product).data)

#             # Scrape product if not in DB
#             try:
#                 data = scrape_product(search)
#             except Exception as e:
#                 logger.exception("Scrape failed")
#                 return Response({"error": str(e)}, status=500)

#             if not data or not data.get("price"):
#                 return Response({"error": "Failed to scrape product"}, status=400)

#             # Parse price
#             raw_price = str(data.get("price"))
#             clean_price = re.sub(r"[^\d.]", "", raw_price)
#             try:
#                 price = Decimal(clean_price)
#             except Exception:
#                 return Response({"error": f"Invalid price format: {raw_price}"}, status=400)

#             product = Product.objects.create(
#                 title=data.get("name") or "Unknown",
#                 current_price=price,
#                 currency="₹",
#                 image_url=data.get("image"),
#                 product_url=search,
#             )
#             PriceHistory.objects.create(product=product, price=price)

#             return Response(self.get_serializer(product).data, status=201)

#         # ---------- KEYWORD SEARCH ----------
#         db_matches = Product.objects.filter(title__icontains=search)
#         if db_matches.exists():
#             return Response(self.get_serializer(db_matches, many=True).data)

#         # Scrape if not found in DB
#         results = []
#         try:
#             results.extend(scrape_amazon_search(search) or [])
#         except Exception:
#             logger.exception("Amazon search failed")
#         try:
#             results.extend(scrape_flipkart_search(search) or [])
#         except Exception:
#             logger.exception("Flipkart search failed")

#         return Response({"search_results": results})


# class ProductSearchView(APIView):
#     """Search products across Amazon and Flipkart (keyword only)."""
#     def get(self, request):
#         query = request.GET.get("q")
#         if not query:
#             return Response({"error": "Search query required"}, status=400)

#         results = []
#         try:
#             results.extend(scrape_amazon_search(query) or [])
#         except Exception:
#             logger.exception("Amazon search failed")
#         try:
#             results.extend(scrape_flipkart_search(query) or [])
#         except Exception:
#             logger.exception("Flipkart search failed")

#         return Response(results)





# # ---------------------------------------------------------
# # TRACKED PRODUCTS
# # ---------------------------------------------------------
# class TrackedProductViewSet(viewsets.ModelViewSet):
#     """CRUD for user's tracked products with alert feature."""
#     queryset = TrackedProduct.objects.all()
#     serializer_class = TrackedProductSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         # if self.action == 'all' and self.request.user.is_staff:
#         #     # Admin can see all tracked products in the 'all' action
#         #     return TrackedProduct.objects.all().select_related("product", "user")
#         if self.request.user.is_staff:
#             return TrackedProduct.objects.all().select_related("product", "user")
#         return TrackedProduct.objects.filter(user=self.request.user).select_related("product")
        
 

    
#     @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
#     def all(self, request):
#         """Admin-only endpoint to view all tracked products."""
#         qs = TrackedProduct.objects.all().select_related("product", "user")
#         serializer = self.get_serializer(qs, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=["post"], url_path="set-alert", url_name="set_alert")
#     def set_alert(self, request, pk=None):
#         """Create or update a price alert for a tracked product."""
#         instance = self.get_object()
#         threshold = request.data.get("threshold")
#         if threshold is None:
#             return Response({"detail": "threshold required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             instance.threshold = Decimal(threshold)
#         except Exception:
#             return Response({"detail": "Invalid threshold value"}, status=400)

#         instance.save(update_fields=["threshold"])
#         return Response(self.get_serializer(instance).data, status=200)

#     def perform_create(self, serializer):
#         user = self.request.user
#         product = serializer.validated_data.get("product")
        
#         if TrackedProduct.objects.filter(user=user, product=product).exists():
#             raise ValidationError({"detail": "Price alert already exists for this product."})
        
#         serializer.save(user=user)
    



# class AdminTrackedProductViewSet(viewsets.ModelViewSet):
#     """Admin view to see all tracked products"""
#     queryset = TrackedProduct.objects.all().select_related("product", "user")
#     serializer_class = TrackedProductSerializer
#     permission_classes = [permissions.IsAdminUser]

#     @action(detail=False, methods=["get"], permission_classes=[permissions.IsAdminUser])
#     def all(self, request):
#         """Admin-only endpoint to view all tracked products."""
#         qs = TrackedProduct.objects.all().select_related("product", "user")
#         serializer = self.get_serializer(qs, many=True)
#         return Response(serializer.data)

# # ---------------------------------------------------------
# # HELPER FUNCTION
# # ---------------------------------------------------------
# def is_product_url(url: str) -> bool:
#     """Check if a URL belongs to Amazon or Flipkart."""
#     try:
#         parsed = urlparse(url)
#         host = parsed.netloc.lower()
#         return "amazon." in host or "flipkart.com" in host
#     except Exception:
#         return False
# # ---------------------------------------------------------
# # CLEANUP UTILS
# # ---------------------------------------------------------
# class DeleteLastRecordsView(APIView):
#     """Delete the last N Product records (default = 1)."""
#     def delete(self, request, count=None, *args, **kwargs):
#         count = int(count) if count else 1
#         qs = Product.objects.order_by("-id")[:count]
#         deleted_count = qs.count()
#         qs.delete()
#         return Response({"message": f"Deleted {deleted_count} record(s)"}, status=200)

# # ---------------------------------------------------------
# # Recently Dropped
# # ---------------------------------------------------------
# @api_view(["GET"])
# @permission_classes([permissions.AllowAny])
# def recently_dropped_products(request):
#     """
#     Returns products that had a price drop compared to their previous price.
#     """
#     dropped_products = []

#     for product in Product.objects.all():
#         history = PriceHistory.objects.filter(product=product).order_by("-date")
#         if history.count() >= 2:
#             latest = history[0].price
#             previous = history[1].price
#             if latest < previous:
#                 dropped_products.append(product)

#     if not dropped_products:
#         return Response({"message": "No recent price drops."})

#     serializer = ProductSerializer(dropped_products, many=True)
#     return Response(serializer.data)


# ---------------------------------------------------------
# Imports
# ---------------------------------------------------------
import logging
import re
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.utils.timezone import now, timedelta

from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

# Models
from .models import Product, PriceHistory, TrackedProduct
from .utils import clean_amazon_url, clean_flipkart_url
from .tasks.scraper import scrape_amazon_search, scrape_flipkart_search

# Serializers
from .serializers import (
    ProductSerializer,
    PriceHistorySerializer,
    TrackedProductSerializer,
    UserSerializer,
    SignupSerializer,
    CustomLoginSerializer,
)

# Scraper functions
from PriceTrack.tasks.scraper import scrape_product, scrape_amazon_product, scrape_flipkart_product

logger = logging.getLogger(__name__)
User = get_user_model()


# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def is_product_url(url: str) -> bool:
    """Check if a URL belongs to Amazon or Flipkart."""
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        return "amazon." in host or "flipkart.com" in host
    except Exception:
        return False


def normalize_product_url(url: str) -> str:
    """
    Comprehensive URL normalization for both Amazon and Flipkart
    """
    if not url:
        return url
    
    try:
        if "amazon" in url:
            return clean_amazon_url(url)
        elif "flipkart" in url:
            return clean_flipkart_url(url)
        return url
    except Exception as e:
        logger.error(f"URL normalization error: {e}")
        return url


def find_existing_product_by_url(url: str):
    """
    Find existing product by URL with multiple matching strategies
    """
    try:
        normalized_url = normalize_product_url(url)
        
        # Try exact match first
        product = Product.objects.filter(product_url=normalized_url).first()
        if product:
            return product, normalized_url
        
        # Try ASIN match for Amazon
        if "amazon" in url and "/dp/" in normalized_url:
            try:
                asin = normalized_url.split("/dp/")[1].split("/")[0]
                if len(asin) == 10:
                    product = Product.objects.filter(product_url__contains=asin).first()
                    if product:
                        return product, normalized_url
            except Exception:
                pass
        
        # Try product ID match for Flipkart
        if "flipkart" in url:
            try:
                product_id_match = re.search(r'/p/([a-zA-Z0-9]+)', normalized_url)
                if product_id_match:
                    product_id = product_id_match.group(1)
                    product = Product.objects.filter(product_url__contains=product_id).first()
                    if product:
                        return product, normalized_url
            except Exception:
                pass
        
        return None, normalized_url
    except Exception as e:
        logger.error(f"Error finding existing product: {e}")
        return None, url


# ---------------------------------------------------------
# HOME & DASHBOARD
# ---------------------------------------------------------
def home(request):
    """Simple API home endpoint."""
    return JsonResponse({"message": "Welcome to Price Tracker API"})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """
    Returns total counts for Products, Users, and Tracked Items
    """
    try:
        total_products = Product.objects.count()
        total_users = User.objects.count()
        total_tracked = TrackedProduct.objects.count()

        data = {
            'products': total_products,
            'users': total_users,
            'tracked_items': total_tracked,
        }
        return Response(data, status=200)
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def recently_dropped_products(request):
    """
    Returns products that had a price drop compared to their previous price.
    """
    try:
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
    except Exception as e:
        logger.error(f"Recently dropped products error: {e}")
        return Response({"error": str(e)}, status=500)


# ---------------------------------------------------------
# AUTHENTICATION VIEWS
# ---------------------------------------------------------
class SignupView(generics.CreateAPIView):
    """User signup endpoint with JWT token return."""
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
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
        except Exception as e:
            logger.error(f"Signup error: {e}")
            return Response({"error": "Registration failed"}, status=400)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            data = serializer.validated_data
            return Response({
                "refresh": data["refresh"],
                "access": data["access"],
                "user": UserSerializer(user).data,
            })
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({"error": "Login failed"}, status=400)


class LoginView(CustomTokenObtainPairView):
    """Alias for token obtain view"""
    pass


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class MeView(APIView):
    """Return current authenticated user info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            return Response(UserSerializer(request.user).data)
        except Exception as e:
            logger.error(f"Me view error: {e}")
            return Response({"error": str(e)}, status=500)


class LogoutView(APIView):
    """Blacklist refresh token to log out."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = request.data.get("refresh")
            if not token:
                return Response({"detail": "refresh token required"}, status=400)
            RefreshToken(token).blacklist()
            return Response({"detail": "logged out"})
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response({"detail": "invalid token"}, status=400)


# ---------------------------------------------------------
# USER MANAGEMENT
# ---------------------------------------------------------
class UserViewSet(viewsets.ModelViewSet):
    """Admin-only view for managing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# ---------------------------------------------------------
# PRODUCT VIEWS
# ---------------------------------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    """Read-only viewset for products with URL & keyword search."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        # Allow everyone to view (GET)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        # Only admins can delete, update, or create
        return [IsAdminUser()]

    def _create_product_from_scraped_data(self, normalized_url: str, data: dict):
        """Helper method to create product from scraped data"""
        try:
            # Parse price
            raw_price = str(data.get("price", "0"))
            clean_price = re.sub(r"[^\d.]", "", raw_price)
            
            if not clean_price:
                raise ValueError("No price found")
                
            price = Decimal(clean_price)
            
            # Create product with normalized URL
            product = Product.objects.create(
                title=data.get("name") or "Unknown Product",
                current_price=price,
                currency="₹",
                image_url=data.get("image") or "",
                product_url=normalized_url,
            )
            PriceHistory.objects.create(product=product, price=price)
            return product
            
        except (InvalidOperation, ValueError, TypeError) as e:
            logger.error(f"Price parsing error: {e}")
            raise ValidationError(f"Invalid price format: {raw_price}")
        except Exception as e:
            logger.error(f"Product creation error: {e}")
            raise

    def list(self, request, *args, **kwargs):
        search = request.query_params.get("search")
        if not search:
            return super().list(request, *args, **kwargs)

        # ---------- PRODUCT URL SEARCH ----------
        if is_product_url(search):
            try:
                # Find existing product with URL normalization
                existing_product, normalized_url = find_existing_product_by_url(search)
                
                if existing_product:
                    return Response(self.get_serializer(existing_product).data)

                # Scrape product if not in DB
                data = scrape_product(normalized_url)
                if not data or not data.get("price"):
                    return Response({"error": "Failed to scrape product"}, status=400)

                # Double-check if product was created by another request
                existing_product = Product.objects.filter(product_url=normalized_url).first()
                if existing_product:
                    return Response(self.get_serializer(existing_product).data)

                # Create new product
                product = self._create_product_from_scraped_data(normalized_url, data)
                return Response(self.get_serializer(product).data, status=201)

            except ValidationError as e:
                return Response({"error": str(e)}, status=400)
            except Exception as e:
                logger.exception("Product search failed")
                return Response({"error": "Failed to process product"}, status=500)

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

    def destroy(self, request, *args, **kwargs):
        """Delete a product safely."""
        try:
            instance = self.get_object()
            product_title = instance.title
            self.perform_destroy(instance)
            return Response(
                {"message": f"Product '{product_title}' deleted successfully."}, 
                status=status.HTTP_200_OK
            )
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Product deletion error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductSearchView(APIView):
    """Search products across Amazon and Flipkart (keyword only)."""
    permission_classes = [AllowAny]
    
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
# PRICE HISTORY VIEWS
# ---------------------------------------------------------
class PriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """View price histories. Admins see all; users see only their products."""
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all, users only see their own product histories
        if self.request.user.is_staff:
            return PriceHistory.objects.all().select_related("product")
        return PriceHistory.objects.filter(
            product__trackedproduct__user=self.request.user
        ).select_related("product")


class ProductPriceHistoryView(APIView):
    """Get price history for a specific product"""
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            histories = PriceHistory.objects.filter(product__id=pk).order_by("-date")
            serializer = PriceHistorySerializer(histories, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Product price history error: {e}")
            return Response({"error": str(e)}, status=500)


class AdminPriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin view to see all price histories"""
    queryset = PriceHistory.objects.all().select_related("product")
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAdminUser]


# ---------------------------------------------------------
# TRACKED PRODUCT VIEWS
# ---------------------------------------------------------
class TrackedProductViewSet(viewsets.ModelViewSet):
    """CRUD for user's tracked products with alert feature."""
    serializer_class = TrackedProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return TrackedProduct.objects.all().select_related("product", "user")
        return TrackedProduct.objects.filter(user=self.request.user).select_related("product")

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data.get("product")
        
        if TrackedProduct.objects.filter(user=user, product=product).exists():
            raise ValidationError({"detail": "Price alert already exists for this product."})
        
        serializer.save(user=user)

    @action(detail=True, methods=["post"], url_path="set-alert")
    def set_alert(self, request, pk=None):
        """Create or update a price alert for a tracked product."""
        try:
            instance = self.get_object()
            threshold = request.data.get("threshold")
            
            if threshold is None:
                return Response(
                    {"detail": "threshold required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            instance.threshold = Decimal(threshold)
            instance.save(update_fields=["threshold"])
            return Response(self.get_serializer(instance).data, status=200)
            
        except (InvalidOperation, ValueError) as e:
            return Response({"detail": "Invalid threshold value"}, status=400)
        except Exception as e:
            logger.error(f"Set alert error: {e}")
            return Response({"detail": "Failed to set alert"}, status=500)

    @action(detail=False, methods=["get"], permission_classes=[IsAdminUser])
    def all(self, request):
        """Admin-only endpoint to view all tracked products."""
        try:
            qs = TrackedProduct.objects.all().select_related("product", "user")
            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Tracked products all error: {e}")
            return Response({"error": str(e)}, status=500)


class AdminTrackedProductViewSet(viewsets.ModelViewSet):
    """Admin view to see all tracked products"""
    queryset = TrackedProduct.objects.all().select_related("product", "user")
    serializer_class = TrackedProductSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=["get"])
    def all(self, request):
        """Admin-only endpoint to view all tracked products."""
        try:
            qs = TrackedProduct.objects.all().select_related("product", "user")
            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Admin tracked products error: {e}")
            return Response({"error": str(e)}, status=500)


# ---------------------------------------------------------
# CLEANUP & UTILITY VIEWS
# ---------------------------------------------------------
class DeleteLastRecordsView(APIView):
    """Delete the last N Product records (default = 1)."""
    permission_classes = [IsAdminUser]
    
    def delete(self, request, count=None):
        try:
            count = int(count) if count else 1
            qs = Product.objects.order_by("-id")[:count]
            deleted_count = qs.count()
            deleted_titles = [product.title for product in qs]
            qs.delete()
            
            return Response({
                "message": f"Deleted {deleted_count} record(s)",
                "deleted_products": deleted_titles
            }, status=200)
        except Exception as e:
            logger.error(f"Delete records error: {e}")
            return Response({"error": str(e)}, status=500)