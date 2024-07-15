from typing import Union
from django.forms import BaseModelForm
from django.http import HttpRequest, HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView
from dashboard.models import User
from identity.enums import VerificationTokenTypes
from identity.forms import SignupForm
from core.mixins import GuestOnlyMixin
from django.contrib.auth import authenticate, login
from django.contrib import messages
import os
from core import settings
from dashboard.tasks import email_sender
from django.shortcuts import redirect
from django.contrib.auth.models import AbstractUser
from identity.models import verification_token
from identity.services.verification_token_service import VerificationTokenService


class SignupView(GuestOnlyMixin, CreateView):
    template_name = "identity/signup.html"
    form_class = SignupForm
    success_url = reverse_lazy("dashboard")

    def form_valid(self, form):
        form.save()

        user_email = form.cleaned_data["email"]
        user = authenticate(
            self.request,
            email=user_email,
            password=form.cleaned_data["password1"],
        )

        if not user:
            messages.error(
                self.request,
                "No user found",
            )
            return self.form_invalid(form)

        self._send_signup_email(user)

        login(self.request, user)

        messages.success(self.request, "Welcome on board!")
        return redirect(self.success_url)

    def form_invalid(self, form: BaseModelForm) -> HttpResponse:
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)

    def _send_signup_email(self, user: Union[User, AbstractUser]):
        """Trigger an email verification event to Celery/RabbitMQ"""
        service = VerificationTokenService(
            VerificationTokenTypes.EMAIL_VERIFICATION.value, user
        )

        token = service.generate_email_token()
        if token:
            verification_link = (
                VerificationTokenService.generate_email_verification_url(token)
            )

            context = {
                "subject": "Email Verification",
                "verification_link": verification_link,
            }

            template = os.path.join(
                settings.BASE_DIR,
                "identity/templates/identity/emails/email_verification.email.html",
            )
            email_sender.delay("Welcome to Metton", [user.email], template, context)
