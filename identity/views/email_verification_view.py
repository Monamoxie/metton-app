from typing import Any
from django.views.generic import TemplateView

from identity.enums import VerificationTypes
from identity.services.verification_token_service import VerificationTokenService


class EmailVerificationView(TemplateView):
    """Handles email verification"""

    template_name = "identity/email_verification.html"

    def get_context_data(self, **kwargs) -> dict[str, Any]:
        """Check token and include some extra data, before passing it over to the template"""
        context = super().get_context_data(**kwargs)

        token = self.kwargs.get("token")
        verification_type = VerificationTypes.EMAIL_VERIFICATION.value
        service = VerificationTokenService(verification_type)
        
        status = service.verify_email_token(token)

        context["valid"] = status == VerificationTokenService.SUCCESS_STATUS
        context["type"] = "Email"
        context["token_status"] = status

        return context
