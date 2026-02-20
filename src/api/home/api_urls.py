from django.urls import path
from home.views.api import PlatformSettingsView


# API Routes ::: Migration to DRF in progress
urlpatterns = [
    # NO AUTHENTICATION REQUIRED
    path("settings", PlatformSettingsView.as_view(), name="platform-settings"), 
    
]
