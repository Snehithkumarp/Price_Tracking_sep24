"""
URL configuration for Django_Pro project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# ---------------------------
# URL Configuration
# ---------------------------
urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Include all app-level URLs from PriceTrack
    # All endpoints like /api/products/, /api/auth/... will be handled in PriceTrack.urls
    path("api/", include("PriceTrack.urls")),
]

