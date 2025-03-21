
from rest_framework import serializers
from datetime import datetime
from core import settings


class PlatformSettingsSerializer(serializers.Serializer): 
    def to_representation(self, instance):
        return {
            "base_url": settings.BASE_URL.rstrip().rstrip("/") if settings.BASE_URL else "",
            "project_name": settings.PROJECT_NAME,
            "curr_year": datetime.today().year,
            "has_privacy_policy": settings.HAS_PRIVACY_POLICY,
            "privacy_policy_url": settings.PRIVACY_POLICY_URL,
            "has_terms_of_service": settings.HAS_TERMS_OF_SERVICE,
            "terms_of_service_url": settings.TERMS_OF_SERVICE_URL,
            "has_cookies_consent_mode": settings.HAS_COOKIES_CONSENT_MODE,
            "has_google_tag_manager": settings.HAS_GOOGLE_TAG_MANAGER,
            "google_tag_manager_id": settings.GOOGLE_TAG_MANAGER_ID,
            "has_google_recaptcha": settings.HAS_GOOGLE_RECAPTCHA,
        }