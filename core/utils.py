import os
from xmlrpc.client import Boolean
from core import settings
from core.data.template_data import TemplateData
import requests

def template_data(request):
    return {"template_data": TemplateData()}


def get_template_path(app: str, relative_path: str) -> str:
    path = f"{app}/templates/{app}/{relative_path}"
    return os.path.join(settings.BASE_DIR, path)


class CoreUtils:
    @staticmethod
    def validate_recaptcha(token: str) -> None | Boolean:
        if settings.HAS_GOOGLE_RECAPTCHA and settings.RECAPTCHA_PRIVATE_KEY:
            # Validate reCAPTCHA v3 token with Google
            response = requests.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": settings.RECAPTCHA_PRIVATE_KEY,
                    "response": token,
                }
            ).json()
            print(response)

            if not response.get("success"):
                raise Exception("Invalid token")
            elif response.get("score", 0) < 0.6:
                raise Exception("reCaptcha validation failed")
            
            return True

        return None  

