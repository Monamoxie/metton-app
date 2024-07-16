from typing import Any
from django.views.generic import TemplateView

from identity.enums import VerificationTokenTypes
from identity.services.verification_token_service import VerificationTokenService


class EmailVerificationView(TemplateView):
    """Handles email verification"""

    template_name = "identity/email_verification.html"

    def get_context_data(self, **kwargs) -> dict[str, Any]:
        """Check token and include some extra data, before passing it over to the template"""
        context = super().get_context_data(**kwargs)

        token = self.kwargs.get("token")
        status = VerificationTokenService(
            VerificationTokenTypes.EMAIL_VERIFICATION.value, None
        ).verify_email_token(token)

        context["valid"] = status == VerificationTokenService.SUCCESS_STATUS
        context["type"] = "Email"
        context["token_status"] = status

        return context
