"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import path
from django.urls import include
from core import settings
from django.conf.urls.static import static

# Deprecated in favor of DRF ::: Migration to DRF in progress
urlpatterns = [
    path("admin/", admin.site.urls),
    path("identity/", include("identity.urls")),
    path("dashboard/", include("dashboard.urls")),
    path("", include("home.urls")),
]

urlpatterns += [
    path("api/v1/identity/", include("identity.api_urls")),
    path("api/v1/platform/", include("home.api_urls")),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
