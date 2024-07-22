from django.http import HttpRequest, HttpResponse
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import redirect, render
from core.mixins import GuestOnlyMixin
from core.services.user_service import UserService
from identity.enums import VerificationTypes
from django.contrib.auth.forms import PasswordResetForm
from identity.services import VerificationTokenService
import os
from core import settings
from dashboard.tasks import email_sender
from typing import Any


class ForgotPasswordView(GuestOnlyMixin, FormView):
    template_name = "identity/forgot_password.html"
    success_url = reverse_lazy("forgot-password")
    form_class = PasswordResetForm

    def form_valid(self, form):
        """Trigger an email verification event to Celery/RabbitMQ"""
        user = UserService.get_user_by_email(form.cleaned_data["email"])

        if user:
            verification_type = VerificationTypes.FORGOT_PASSWORD_VERIFICATION.value

            service = VerificationTokenService(verification_type, user)
            token = service.generate_token()

            if not token:
                messages.error(self.request, service.UNABLE_TO_GENERATE_TOKEN_STATUS)
                return super().form_valid(form)

            verification_link = service.generate_reset_password_verification_link(token)
            context = {"verification_link": verification_link}

            template = os.path.join(
                settings.BASE_DIR,
                "identity/templates/identity/emails/password_reset.email.html",
            )
            email_sender.delay("Password Reset", [user.email], template, context)

        # Send a generic message to avoid email spammers knowing if the email is registered
        messages.success(
            self.request,
            "A reset link has been sent to the email address you provided. Please check your inbox and follow the instructions",
        )
        return super().form_valid(form)

    def form_invalid(self, form) -> HttpResponse:
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)
