from pyexpat.errors import messages
from typing import Any
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from identity.enums import VerificationTypes
from identity.services.verification_token_service import VerificationTokenService
from django.contrib import messages
from identity.utils import send_signup_email


class ResendEmailVerificationView(LoginRequiredMixin, View):
    """Resend email verification"""

    redirect_url = reverse_lazy("profile-update")

    def post(self, request):
        if request.user.email_verified:
            messages.info(request, "Your email is already verified")
        else:
            send_signup_email(user=request.user)
            messages.success(
                request,
                "Verification instructions has been successfully sent to your email address",
            )

        return redirect(self.redirect_url)
