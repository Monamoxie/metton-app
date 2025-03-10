from core import settings
from datetime import datetime


class TemplateData:
    def __init__(self):
        self.base_url = settings.BASE_URL.rstrip().rstrip("/")
        self.project_name = settings.PROJECT_NAME
        self.curr_year = datetime.today().year

        self.has_privacy_policy = settings.HAS_PRIVACY_POLICY
        self.privacy_policy_url = settings.PRIVACY_POLICY_URL

        self.has_terms_of_service = settings.HAS_TERMS_OF_SERVICE
        self.terms_of_service_url = settings.TERMS_OF_SERVICE_URL

        self.has_cookies_consent_mode = settings.HAS_COOKIES_CONSENT_MODE

        self.has_google_tag_manager = settings.HAS_GOOGLE_TAG_MANAGER
        self.google_tag_manager_head_script = settings.GOOGLE_TAG_MANAGER_HEAD_SCRIPT
        self.google_tag_manager_body_script = settings.GOOGLE_TAG_MANAGER_BODY_SCRIPT
